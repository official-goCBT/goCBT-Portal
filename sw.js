const CACHE_NAME = 'gocbt-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch Assets
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
// ... [Previous Cache Logic] ...

// Listen for Push Notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'goCBT Update', body: 'New notification received!' };
    
    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3413/3413535.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3413/3413535.png',
        vibrate: [100, 50, 100],
        data: { url: './index.html' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
