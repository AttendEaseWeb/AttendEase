import { Router } from 'express';
import { AttendanceService } from '../services/attendance.service';

export const attendanceRouter = Router();

attendanceRouter.get('/', (req, res, next) => {
  try {
    const { sessionId, studentId } = req.query;
    if (sessionId) {
      return res.json(AttendanceService.getAttendanceBySession(sessionId as string));
    }
    if (studentId) {
      return res.json(AttendanceService.getAttendanceByStudent(studentId as string));
    }
    res.json(AttendanceService.getAllAttendance());
  } catch (err) {
    next(err);
  }
});

attendanceRouter.get('/stats', (req, res, next) => {
  try {
    const { studentId } = req.query;
    const stats = AttendanceService.getStats(studentId as string | undefined);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

attendanceRouter.post('/checkin', (req, res, next) => {
  try {
    const { sessionId, studentId, qrToken, latitude, longitude } = req.body;
    if (!sessionId || !studentId) {
      return res.status(400).json({ error: 'Session ID and Student ID are required' });
    }
    const record = AttendanceService.checkIn({ sessionId, studentId, qrToken, latitude, longitude });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

attendanceRouter.post('/manual', (req, res, next) => {
  try {
    const { sessionId, studentId, status, notes } = req.body;
    if (!sessionId || !studentId || !status) {
      return res.status(400).json({ error: 'Session ID, Student ID, and Status are required' });
    }
    const record = AttendanceService.manualCheckIn({ sessionId, studentId, status, notes });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});
