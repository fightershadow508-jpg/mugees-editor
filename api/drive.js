// Google Drive video proxy — streams a publicly shared Drive file as native MP4
// so in-page <video> playback (incl. iOS Safari + seeking) works for Drive lessons.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const CHUNK = 10 * 1024 * 1024; // cap each response at 10MB; players request more ranges as needed

module.exports = async function handler(req, res) {
  try {
    let id = '';
    try { id = String((req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id') || '').trim(); } catch (e) {}
    if (!/^[A-Za-z0-9_-]{10,}$/.test(id)) { res.status(400).send('Bad file id'); return; }

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

    // Step 1: walk Drive's download dance (redirect hop, then virus-scan interstitial w/ uuid) to find the real stream URL
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
    res.setHeader('Cache-Control', 'private, max-age=3600');
    if (!r2.body) { res.end(); return; }
    for await (const chunk of r2.body) { res.write(chunk); }
    res.end();
  } catch (e) {
    try { if (!res.headersSent) res.status(500).send('Proxy error'); } catch (e2) {}
  }
};
