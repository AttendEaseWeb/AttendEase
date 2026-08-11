// Helper for frontend IndexedDB operations and Service Worker registration

export function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AttendEaseOfflineDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id' });
      }
    };
  });
}

export async function addToSyncQueue(url: string, method: string, payload: any, headers: any = {}) {
  const db = await openSyncDB();
  const id = crypto.randomUUID();
  const timestamp = Date.now();
  
  // Attach idempotency key to payload
  const payloadWithMetadata = { ...payload, __syncId: id, __timestamp: timestamp };

  const item = {
    id,
    url,
    method,
    headers: { ...headers, 'Content-Type': 'application/json' },
    payload: payloadWithMetadata,
    timestamp
  };

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('sync-queue', 'readwrite');
    const store = transaction.objectStore('sync-queue');
    const request = store.add(item);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function registerServiceWorkerAndSync() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[App] Service Worker registered with scope:', registration.scope);

      // Wait for the service worker to be ready before registering sync
      const readyRegistration = await navigator.serviceWorker.ready;

      // Request background sync permission if available
      if ('sync' in readyRegistration) {
        try {
          await (readyRegistration as any).sync.register('sync-data');
          console.log('[App] Background Sync registered for tag: sync-data');
        } catch (err: any) {
          console.warn('[App] Background Sync registration failed (expected in some iframe environments):', err.message || err);
        }
      }
    } catch (error) {
      console.error('[App] Service Worker registration failed:', error);
    }
  }

  // Fallback for browsers that don't support Background Sync
  window.addEventListener('online', () => {
    console.log('[App] Browser is back online, triggering manual sync...');
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC' });
    }
  });
}

/**
 * Enhanced fetch function that intercepts failed requests and queues them when offline.
 */
export async function offlineCapableFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method || 'GET';
  
  // We only queue mutations (POST, PUT, DELETE, PATCH)
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());

  if (!navigator.onLine && isMutation) {
    console.log('[App] Offline detected. Queuing request to:', url);
    let payload = {};
    if (options.body) {
      payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    }
    await addToSyncQueue(url, method, payload, options.headers);
    
    // Register sync immediately to ensure it fires when online
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if ('sync' in reg) {
        await (reg as any).sync.register('sync-data').catch((e: any) => console.warn('Sync register skipped:', e.message || e));
      }
    }
    
    // Return a mocked successful response so the UI proceeds gracefully
    return new Response(JSON.stringify({ 
      success: true, 
      offline: true, 
      message: 'You are offline. Data saved locally and will sync when connection returns.' 
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
      let payload = {};
      if (options.body) {
        payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      }
      await addToSyncQueue(url, method, payload, options.headers);
      
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if ('sync' in reg) {
          await (reg as any).sync.register('sync-data').catch((e: any) => console.warn('Sync register skipped:', e.message || e));
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        offline: true, 
        message: 'Request failed. Data saved locally and will sync when connection returns.' 
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
}


