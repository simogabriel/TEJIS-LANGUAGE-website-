const CACHE = 'tejis-offline-2026-10-20-v15';
const ASSETS = ['/', '/index.html', '/style.css', '/enhancements.css', '/professional.css', '/color-system.css', '/hero-redesign.css', '/responsive-carousel.css', '/closing-sections.css', '/carousels.js', '/app.js', '/animations.js', '/assets/tejis-classes.jpg', '/assets/whatsapp.svg', ...['english','french','german'].map(lang=>`/assets/course-${lang}.jpg`), ...['uk','fr','de'].map(flag=>`/assets/flag-${flag}.svg`), ...['en','fr','de'].flatMap(lang => ['mp4','jpg','vtt'].map(ext => `/assets/language-tests-${lang}.${ext}`))];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('tejis-offline-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
async function mediaResponse(request, cached) {
  const range = request.headers.get('range');
  if (!range) return cached;
  const blob = await cached.blob();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${blob.size}` } });
  const start = match[1] ? Number(match[1]) : Math.max(0, blob.size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), blob.size-1) : blob.size-1;
  if (start > end || start >= blob.size) return new Response(null, { status:416, headers:{'Content-Range':`bytes */${blob.size}`} });
  return new Response(blob.slice(start, end+1), { status:206, headers:{'Content-Type':'video/mp4','Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${blob.size}`,'Accept-Ranges':'bytes'} });
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!ASSETS.includes(url.pathname) && request.mode !== 'navigate') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (url.pathname.endsWith('.mp4')) {
      const cached = await cache.match(url.pathname);
      if (cached) return mediaResponse(request, cached);
    }
    try {
      const response = await fetch(request);
      if (response.ok && !request.headers.has('range')) await cache.put(request, response.clone());
      return response;
    } catch {
      return (await cache.match(request)) || (request.mode === 'navigate' ? await cache.match('/index.html') : undefined) || new Response('Unavailable offline', {status:503});
    }
  })());
});
