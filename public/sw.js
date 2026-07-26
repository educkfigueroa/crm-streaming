// Service Worker for Push Notifications
const CACHE_NAME = 'crm-streaming-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: 'CRM Streaming',
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: data.icon || '/gstreaming.png',
    badge: '/gstreaming.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'crm-notification',
    renotify: true,
    data: data.url || '/',
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CRM Streaming', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
