/* Akademya Tagalog — service worker
   Toujours la dernière version en ligne ; le cache ne sert que hors ligne.
   Même domaine que l'Académie CMD & PowerShell : on ne touche qu'aux caches « akademya-… ». */
const CACHE = 'akademya-v3';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'vendor/supabase-2.117.0.min.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('akademya-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
const save = (req, r) => { if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; };
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  // Polices Google : cache d'abord (fichiers immuables)
  if (u.host.endsWith('fonts.googleapis.com') || u.host.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c2 = r.clone(); caches.open(CACHE).then(c => c.put(req, c2)); } return r; })));
    return;
  }
  if (u.origin !== self.location.origin) return; // Supabase, météo : jamais en cache
  if (u.pathname.includes('/audio/')) {
    // MP3 : réseau + cache HTTP du navigateur (lectures partielles gérées partout, iOS compris)
    if (u.pathname.endsWith('/index.json')) e.respondWith(fetch(req).then(r => save(req, r)).catch(() => caches.match(req)));
    return;
  }
  const isPage = req.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  e.respondWith(
    fetch(req, { cache: isPage ? 'no-store' : 'no-cache' }).then(r => save(req, r))
      .catch(() => caches.match(req).then(r => r || (isPage ? caches.match('index.html') : undefined)))
  );
});
