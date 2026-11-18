// Minimal service worker so the dashboard can be installed as an app.
// Network only, no caching: the page always shows the latest data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
