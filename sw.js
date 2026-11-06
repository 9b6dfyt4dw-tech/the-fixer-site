/* the-fixer.org service worker (2026-11-06, loading times).
   GitHub Pages sends Cache-Control: max-age=600 on everything, so every visit after ten minutes
   re-downloads the product covers and previews. This keeps image assets under /assets/ in a
   cache: cached copy first (instant repeat visits), refreshed in the background so a changed
   cover shows on the next visit. HTML, CSS, JS, fonts and videos are never touched. */
const C = 'fx-img-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('fx-img-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin || !u.pathname.startsWith('/assets/') || !/\.(webp|png|jpg|jpeg|ico|svg)$/i.test(u.pathname)) return;
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(r);
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res }).catch(() => hit);
    return hit || net;
  }));
});
