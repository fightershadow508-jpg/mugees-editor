// Gated Drive proxy — streams a Drive file ONLY to students whose email is in
// the lesson's invited list (gated_lesson_files.allowed_emails). The Drive file
// id never reaches the client: the browser only ever sees the lesson id.
// Auth: the student's Supabase JWT (from the academy's own login) is verified
// via auth/v1/user, then the file row is read through PostgREST with that same
// token, so Row Level Security enforces the invited-only rule server-side.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const CHUNK = 10 * 1024 * 1024; // cap each response at 10MB; players request more ranges as needed
const SUPABASE_URL = 'https://ijsvpdraigzvxeeuedzd.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_FlaAOinEJSeHyLTEaEAJrQ_QR_N3dBe'; // public client key, same as app.js

module.exports = async function handler(req, res) {
  try {
    let lessonId = '', token = '';
    try {
      const u = new URL(req.url, 'http://x');
      lessonId = String(u.searchParams.get('lesson') || '').trim();
      token = String(u.searchParams.get('token') || '').trim();
    } catch (e) {}
    if (!lessonId || !token) { res.status(401).send('Missing lesson or token'); return; }

    // Step 0a: verify the session token and learn the viewer's email.
    let me;
    try {
      me = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: PUBLISHABLE_KEY, Authorization: 'Bearer ' + token } });
    } catch (e) { res.status(401).send('Invalid session'); return; }
    if (!me.ok) { res.status(401).send('Invalid session'); return; }
    let user = null;
    try { user = await me.json(); } catch (e) {}
    const email = String((user && user.email) || '').trim().toLowerCase();
    if (!email) { res.status(401).send('Invalid session'); return; }

    // Step 0b: read the gated file row with the viewer's own token. RLS only
    // returns a row when the viewer's email is in allowed_emails (or admin).
    let rows = null;
    try {
      const q = SUPABASE_URL + '/rest/v1/gated_lesson_files?lesson_id=eq.' + encodeURIComponent(lessonId) + '&select=drive_file_id';
      const gr = await fetch(q, { headers: { apikey: PUBLISHABLE_KEY, Authorization: 'Bearer ' + token, Accept: 'application/json' } });
      if (gr.status === 401) { res.status(401).send('Invalid session'); return; }
      if (!gr.ok) { res.status(403).send('Not invited to this lesson'); return; }
      rows = await gr.json();
    } catch (e) { res.status(403).send('Not invited to this lesson'); return; }
    if (!rows || !rows.length || !rows[0].drive_file_id) { res.status(403).send('Not invited to this lesson'); return; }
    const id = String(rows[0].drive_file_id).trim();
    if (!/^[A-Za-z0-9_-]{10,}$/.test(id)) { res.status(502).send('Bad file id'); return; }

    // Step 1: walk Drive's download dance (redirect hop, then virus-scan interstitial w/ uuid) to find the real stream URL
    const cookies = [];
    const grab = (r) => {
      try {
        let list = [];
        if (typeof r.headers.getSetCookie === 'function') list = r.headers.getSetCookie() || [];
        if (!list.length) { const sc = r.headers.get('set-cookie'); if (sc) list = [sc]; }
        for (const c of list) { const p = String(c).split(';')[0].trim(); if (p) cookies.push(p); }
      } catch (e) {}
    };
    const isRedirect = (s) => s === 301 || s === 302 || s === 303 || s === 307 || s === 308;
    const get = (url, extra) => fetch(url, { headers: Object.assign({ 'User-Agent': UA, 'Cookie': cookies.join('; ') }, extra || {}), redirect: 'manual' });
    const ucUrl = 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(id);
    const confirmUrl = (uuid) => 'https://drive.usercontent.google.com/download?id=' + encodeURIComponent(id) + '&export=download&confirm=t&uuid=' + encodeURIComponent(uuid);
    const uuidFrom = async (r) => { try { const html = await r.text(); const m = html.match(/name="uuid" value="([^"]+)"/); return m ? m[1] : null; } catch (e) { return null; } };

    let streamUrl = null;
    let r1 = await get(ucUrl); grab(r1);
    if (isRedirect(r1.status)) {
      const loc1 = r1.headers.get('location');
      let r1b = await get(loc1); grab(r1b);
      if (isRedirect(r1b.status)) {
        streamUrl = r1b.headers.get('location');
      } else if (((r1b.headers.get('content-type') || '').includes('text/html'))) {
        const u = await uuidFrom(r1b);
        if (u) streamUrl = confirmUrl(u);
      } else {
        streamUrl = loc1;
      }
    } else if (r1.ok) {
      const ct1 = r1.headers.get('content-type') || '';
      if (ct1.includes('text/html')) {
        const u = await uuidFrom(r1);
        if (u) streamUrl = confirmUrl(u);
      } else {
        streamUrl = ucUrl;
      }
    }
    if (!streamUrl) { res.status(502).send('Could not resolve Drive file'); return; }

    // Step 2: fetch the stream with a bounded range (players fetch more as they play/seek)
    let start = 0, end = null;
    const rm = String(req.headers.range || '').match(/bytes=(\d+)-(\d*)/);
    if (rm) { start = parseInt(rm[1], 10) || 0; if (rm[2]) end = parseInt(rm[2], 10); }
    if (end === null || end - start + 1 > CHUNK) end = start + CHUNK - 1;
    const h2 = { 'Range': 'bytes=' + start + '-' + end };
    let r2 = await get(streamUrl, h2); grab(r2);
    if (isRedirect(r2.status)) {
      const loc2 = r2.headers.get('location');
      r2 = await fetch(loc2, { headers: Object.assign({ 'User-Agent': UA, 'Cookie': cookies.join('; ') }, h2), redirect: 'follow' });
    }
    const ct = r2.headers.get('content-type') || '';
    if (ct.includes('text/html')) { res.status(502).send('Drive returned a page, not a video'); return; }
    if (!(r2.status === 200 || r2.status === 206)) { res.status(502).send('Drive stream failed'); return; }

    if (req.method === 'HEAD') {
      const cr = r2.headers.get('content-range') || '';
      const tm = cr.match(/\/(\d+)$/);
      res.status(200);
      res.setHeader('Content-Type', ct || 'video/mp4');
      if (tm) res.setHeader('Content-Length', tm[1]);
      res.setHeader('Accept-Ranges', 'bytes');
      res.end(); return;
    }

    res.status(r2.status === 206 ? 206 : 200);
    res.setHeader('Content-Type', ct || 'video/mp4');
    const cl = r2.headers.get('content-length'); if (cl) res.setHeader('Content-Length', cl);
    const cr2 = r2.headers.get('content-range'); if (cr2) res.setHeader('Content-Range', cr2);
    res.setHeader('Accept-Ranges', 'bytes');
    const body = r2.body;
    if (body && typeof body.pipe === 'function') { body.pipe(res); }
    else if (body && body.getReader) {
      const reader = body.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!res.write(value)) await new Promise((r) => res.once('drain', r));
        }
        res.end();
      } catch (e) { try { res.end(); } catch (_) {} }
    } else { res.end(); }
  } catch (e) {
    try { res.status(500).send('Gated stream failed'); } catch (_) {}
  }
};
