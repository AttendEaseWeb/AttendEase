const fs = require('fs');
let sync = fs.readFileSync('src/client/utils/sync.ts', 'utf8');

const updated = `/**
 * Enhanced fetch function that intercepts failed requests and queues them when offline.
 */
export async function offlineCapableFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method || 'GET';
  
  // We only queue mutations (POST, PUT, DELETE, PATCH)
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
  
  if (!navigator.onLine && isMutation) {
    console.log('[App] Offline detected. Queuing request to:', url);
    let payload: any = {};
    if (options.body) {
      try {
        payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      } catch(e) {}
    }
    
    const fakeId = crypto.randomUUID();
    const fakeCreatedAt = new Date().toISOString();
    if (method === 'POST') {
       payload.id = fakeId;
       payload.createdAt = fakeCreatedAt;
    }
    
    await addToSyncQueue(url, method, payload, options.headers);
    
    // Register sync immediately to ensure it fires when online
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if ('sync' in reg) {
          await (reg as any).sync.register('sync-data').catch((e: any) => console.warn('Sync register skipped:', e.message || e));
        }
      } catch(e) {}
    }
    
    // Return a mocked successful response so the UI proceeds gracefully
    return new Response(JSON.stringify({ 
       success: true, 
       offline: true, 
       message: 'You are offline. Data saved locally and will sync when connection returns.',
       id: fakeId,
       createdAt: fakeCreatedAt,
       ...payload
     }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    // If fetch failed due to network error and it's a mutation, queue it
    if (isMutation) {
      console.log('[App] Request failed (likely offline). Queuing request to:', url);
      let payload: any = {};
      if (options.body) {
        try {
          payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        } catch(e) {}
      }
      
      const fakeId = crypto.randomUUID();
      const fakeCreatedAt = new Date().toISOString();
      if (method === 'POST') {
         payload.id = fakeId;
         payload.createdAt = fakeCreatedAt;
      }
      
      await addToSyncQueue(url, method, payload, options.headers);
      
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if ('sync' in reg) {
            await (reg as any).sync.register('sync-data').catch((e: any) => console.warn('Sync register skipped:', e.message || e));
          }
        } catch(e) {}
      }
      
      return new Response(JSON.stringify({ 
         success: true, 
         offline: true, 
         message: 'Request failed. Data saved locally and will sync when connection returns.',
         id: fakeId,
         createdAt: fakeCreatedAt,
         ...payload
       }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // It's a GET request that failed (e.g. offline and SW bypassed)
      console.log('[App] GET Request failed, checking cache manually for:', url);
      if ('caches' in window) {
        try {
          const cache = await caches.open('attendease-api-cache');
          const requestUrl = new URL(url, window.location.origin).toString();
          const cachedResponse = await cache.match(requestUrl);
          if (cachedResponse) {
            return cachedResponse;
          }
        } catch (e) {
          console.warn('Failed to read from cache:', e);
        }
      }
      
      let fallbackBody: any = [];
      if (url.match(/\\/api\\/(users|classes|sessions|attendance)\\/([^\\?]+)/)) {
         fallbackBody = {}; // single object
      }
      return new Response(JSON.stringify(fallbackBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Offline-Fallback': 'true' }
      });
    }
  }
}`;

const parts = sync.split('/**\n * Enhanced fetch function');
sync = parts[0] + updated;

fs.writeFileSync('src/client/utils/sync.ts', sync);
