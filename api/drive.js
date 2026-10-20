// Google Drive video proxy — streams a publicly shared Drive file as native MP4
// so in-page <video> playback (incl. iOS Safari + seeking) works for Drive lessons.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const CHUNK = 10 * 1024 * 1024; // cap each response at 10MB so one function call stays fast; players request more ranges as needed

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

    // Step 1: resolve the real stream URL (Drive interstitial dance for large files)
    let r = await fetch('https://drive.google.com/uc?export=download&id=' + encodeURIComponent(id), { headers: { 'User-Agent': UA }, redirect: 'manual' });
    grab(r);
    let streamUrl = null;
    if (isRedirect(r.status)) {
      streamUrl = r.headers.get('location');
    } else if (r.ok) {
      const ct1 = r.headers.get('content-type') || '';
      if (ct1.includes('video') || ct1.includes('octet-stream')) {
        streamUrl = 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(id);
      } else {
        const html = await r.text();
        const um = html.match(/name="uuid" value="([^"]+)"/);
        if (um) streamUrl = 'https://drive.usercontent.google.com/download?id=' + encodeURIComponent(id) + '&export=download&confirm=t&uuid=' + encodeURIComponent(um[1]);
      }
    }
    if (!streamUrl) { res.status(502).send('Could not resolve Drive file'); return; }

    // Step 2: bounded range for this response
    let start = 0, end = null;
    const rm = String(req.headers.range || '').match(/bytes=(\d+)-(\d*)/);
    if (rm) { start = parseInt(rm[1], 10) || 0; if (rm[2]) end = parseInt(rm[2], 10); }
    if (end === null || end - start + 1 > CHUNK) end = start + CHUNK - 1;

    const h2 = { 'User-Agent': UA, 'Cookie': cookies.join('; '), 'Range': 'bytes=' + start + '-' + end };
    let r2 = await fetch(streamUrl, { headers: h2, redirect: 'manual' });
    grab(r2);
    if (isRedirect(r2.status)) {
      const loc = r2.headers.get('location');
      r2 = await fetch(loc, { headers: h2, redirect: 'follow' });
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
