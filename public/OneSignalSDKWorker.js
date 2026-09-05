importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
const CACHE_NAME = 'attendease-cache-v1';
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
            // If offline and not in cache, return empty array/object based on common patterns
            // to prevent JSON parse errors in the UI
            let fallbackBody = [];
            if (url.pathname.match(/\/api\/(users|classes|sessions|attendance)\/.+/)) {
               fallbackBody = {}; // single object
            }
            return new Response(JSON.stringify(fallbackBody), {
              status: 200,
              headers: { 'Content-Type': 'application/json', 'X-Offline-Fallback': 'true' }
            });
          });
        })
      );
    }
    // Let non-GET /api/ requests pass through
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Network falling back to cache strategy
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache dynamic assets if they are successful GET requests
        if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If network fails, return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback for document requests (SPA routing)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });

      return fetchPromise;
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
    console.log('[Service Worker] No items in sync queue.');
    return;
  }

  try {
    console.log(`[Service Worker] Syncing ${items.length} items to /api/sync`);
    
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ operations: items })
    });

    if (response.ok) {
      console.log(`[Service Worker] Bulk sync successful (Status ${response.status})`);
      // Clear all items that were successfully synced
      for (const item of items) {
        await deleteQueueItem(item.id);
      }
    } else {
      console.error(`[Service Worker] Server returned ${response.status} for bulk sync, will retry later.`);
      if (response.status >= 400 && response.status < 500) {
          // If it's a client error (e.g. malformed data), we might want to discard to avoid infinite loops,
          // but for safety, we keep it or handle it in the backend deduplication logic.
          console.warn('[Service Worker] Client error during sync. Keeping data to prevent loss.');
      }
    }
  } catch (err) {
    console.error(`[Service Worker] Failed to sync bulk items:`, err);
    // Throwing error here is important! It tells the Background Sync API 
    // that the sync failed and it should retry the sync event later.
    throw err;
  }
}

// Listen for messages from frontend to trigger sync manually (fallback)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    console.log('[Service Worker] Manual sync triggered from client');
    processSyncQueue();
  }
});
