import { Router } from 'express';
import { dbStore } from '../db/store';
import { AttendanceService } from '../services/attendance.service';
import { UserService } from '../services/user.service';
import { ClassService } from '../services/class.service';

export const syncRouter = Router();

// In-memory set for basic deduplication (idempotency key tracking)
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

      try {
        const { url, method, payload } = op;
        const normalizedMethod = (method || 'POST').toUpperCase();
        
        if (url.includes('/api/attendance/manual') && normalizedMethod === 'POST') {
          AttendanceService.manualCheckIn({
            sessionId: payload.sessionId,
            studentId: payload.studentId,
            status: payload.status,
            notes: payload.notes ? `${payload.notes} (Synced)` : 'Synced via Background Sync',
          });
          results.push({ id: syncId, status: 'success' });
        } else if (url.includes('/api/attendance/checkin') && normalizedMethod === 'POST') {
          AttendanceService.checkIn({
            sessionId: payload.sessionId,
            studentId: payload.studentId,
            qrToken: payload.qrToken,
            latitude: payload.latitude,
            longitude: payload.longitude,
          });
          results.push({ id: syncId, status: 'success' });
        } else if (url.includes('/api/users') && normalizedMethod === 'POST') {
          const name = payload.name || 'Unknown';
          const cleanStudentId = payload.studentId || `STU-${Math.floor(100000 + Math.random() * 900000)}`;
          let effectiveEmail = payload.email;
          if (!effectiveEmail) {
            const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            effectiveEmail = `${slug}.${cleanStudentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@school.edu.ph`;
          }
          const newUser = {
             id: payload.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
             name: name.trim(),
             email: effectiveEmail,
             parentPhone: payload.parentPhone ? payload.parentPhone.trim() : undefined,
             role: payload.role || 'STUDENT',
             studentId: cleanStudentId,
             department: payload.department || 'General Education',
             avatarUrl: payload.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
             createdAt: payload.createdAt || new Date().toISOString()
          };
          UserService.createUser(newUser);
          results.push({ id: syncId, status: 'success' });
        } else if (url.includes('/api/classes') && normalizedMethod === 'POST') {
          ClassService.createClass(payload);
          results.push({ id: syncId, status: 'success' });
        } else if (url.includes('/api/sessions') && normalizedMethod === 'POST') {
          ClassService.createSession(payload);
          results.push({ id: syncId, status: 'success' });
        } else if (url.match(/\/api\/classes\/([^\/]+)$/) && normalizedMethod === 'PUT') {
          const match = url.match(/\/api\/classes\/([^\/]+)$/);
          if (match) ClassService.updateClass(match[1], payload);
          results.push({ id: syncId, status: 'success' });
        } else if (url.match(/\/api\/classes\/([^\/]+)$/) && normalizedMethod === 'DELETE') {
          const match = url.match(/\/api\/classes\/([^\/]+)$/);
          if (match) ClassService.deleteClass(match[1]);
          results.push({ id: syncId, status: 'success' });
        } else if (url.match(/\/api\/users\/([^\/]+)$/) && normalizedMethod === 'DELETE') {
          const match = url.match(/\/api\/users\/([^\/]+)$/);
          if (match) dbStore.deleteUser(match[1]);
          results.push({ id: syncId, status: 'success' });
        } else {
          console.log(`[Sync API] Generic sync route fallback for: ${normalizedMethod} ${url}`);
          results.push({ id: syncId, status: 'handled_fallback' });
        }

        if (syncId) {
          processedSyncIds.add(syncId);
        }
      } catch (err: any) {
        console.error(`[Sync API] Error processing operation ${syncId}:`, err);
        results.push({ id: syncId, status: 'error', error: err.message });
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Processed ${operations.length} operations`,
      results
    });
  } catch (error) {
    console.error('[Sync API] Sync error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during sync' });
  }
});

