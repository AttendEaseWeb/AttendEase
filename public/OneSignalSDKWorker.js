importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = 'attendease-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle API requests (Network first, fallback to cache)
  if (url.pathname.startsWith('/api/')) {
    if (event.request.method === 'GET') {
      event.respondWith(
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open('attendease-api-cache').then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            let fallbackBody = [];
            if (url.pathname.match(/\/api\/(users|classes|sessions|attendance)\/.+/)) {
               fallbackBody = {}; 
            }
            return new Response(JSON.stringify(fallbackBody), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'X-Offline-Fallback': 'true' }
            });
          });
        })
      );
    }
    return;
  }

  // STATIC ASSETS: Cache First, Fallback to Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// IndexedDB Helper functions for SW
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AttendEaseOfflineDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id' });
      }
    };
  });
}

function getAllQueueItems() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('sync-queue', 'readonly');
      const store = transaction.objectStore('sync-queue');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function deleteQueueItem(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('sync-queue', 'readwrite');
      const store = transaction.objectStore('sync-queue');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event triggered:', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  console.log('[Service Worker] Processing sync queue...');
  const items = await getAllQueueItems();
  
  if (items.length === 0) {
    return;
  }

  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: items })
    });
    if (response.ok) {
      for (const item of items) {
        await deleteQueueItem(item.id);
      }
    } else {
      console.error(`[Service Worker] Server returned ${response.status} for bulk sync.`);
    }
  } catch (err) {
    throw err;
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    processSyncQueue();
  }
});
