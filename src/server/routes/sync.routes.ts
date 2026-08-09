import { Router } from 'express';
import { dbStore } from '../db/store';

export const syncRouter = Router();

// In-memory set for basic deduplication (idempotency key tracking)
// In a real app, this should be stored in a persistent database (e.g. Redis or a SQL table)
const processedSyncIds = new Set<string>();

syncRouter.post('/', (req, res, next) => {
  try {
    const { operations } = req.body;
    
    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({ success: false, message: 'Invalid sync payload format' });
    }

    console.log(`[Sync API] Received ${operations.length} operations for background sync.`);

    const results = [];

    for (const op of operations) {
      const syncId = op.id || (op.payload && op.payload.__syncId);
      
      // Idempotency check: Skip if we already processed this sync ID
      if (syncId && processedSyncIds.has(syncId)) {
        console.log(`[Sync API] Skipping duplicate operation: ${syncId}`);
        results.push({ id: syncId, status: 'skipped', reason: 'duplicate' });
        continue;
      }

      // Process the operation (simplified dispatch based on URL)
      // For a robust system, you'd route this internally or use an Event Bus
      try {
        const { url, method, payload } = op;
        
        // Example: Intercepting manual check-in
        if (url.includes('/api/attendance/manual') && method === 'POST') {
          // Add to store
          dbStore.addAttendanceRecord({
            id: syncId || Date.now().toString(),
            sessionId: payload.sessionId,
            studentId: payload.studentId,
            studentName: payload.studentName || 'Unknown',
            status: payload.status,
            checkInTime: new Date(payload.__timestamp || Date.now()).toISOString(),
            notes: payload.notes || 'Synced via Background Sync',
          });
          results.push({ id: syncId, status: 'success' });
        } 
        // Other endpoints could be routed here...
        else {
          console.log(`[Sync API] Unhandled sync route: ${method} ${url}`);
          results.push({ id: syncId, status: 'unhandled_route' });
        }

        // Mark as processed
        if (syncId) {
          processedSyncIds.add(syncId);
        }
      } catch (err) {
        console.error(`[Sync API] Error processing operation ${syncId}:`, err);
        results.push({ id: syncId, status: 'error' });
        // Depending on your error handling, you might want to fail the whole batch 
        // to let the client retry, or just fail individual items.
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Processed ${operations.length} operations`,
      results
    });
  } catch (error) {
    console.error('[Sync API] Sync error:', error);
    // Returning 500 ensures the Service Worker keeps the data and retries later
    return res.status(500).json({ success: false, message: 'Internal server error during sync' });
  }
});
