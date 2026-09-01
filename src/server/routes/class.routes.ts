import { Router } from 'express';
import { ClassService } from '../services/class.service';

export const classRouter = Router();

// Classes / Class Sections
classRouter.get('/classes', async (_req, res, next) => {
  try {
    const classes = await ClassService.getAllClasses();
    res.json(classes);
  } catch (err) {
    next(err);
  }
});

classRouter.get('/classes/:id', async (req, res, next) => {
  try {
    const cls = await ClassService.getClassById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class section not found' });
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.post('/classes', async (req, res, next) => {
  try {
    const cls = await ClassService.createClass(req.body);
    res.status(201).json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.put('/classes/:id', async (req, res, next) => {
  try {
    const cls = await ClassService.updateClass(req.params.id, req.body);
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.delete('/classes/:id', async (req, res, next) => {
  try {
    const success = await ClassService.deleteClass(req.params.id);
    res.json({ success });
  } catch (err) {
    next(err);
  }
});

// Student Enrollment Endpoints
classRouter.post('/classes/:id/enroll', async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const cls = await ClassService.enrollStudent(req.params.id, studentId);
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.post('/classes/:id/unenroll', async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const cls = await ClassService.removeStudent(req.params.id, studentId);
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.put('/classes/:id/students', async (req, res, next) => {
  try {
    const { studentIds } = req.body;
    const cls = await ClassService.updateClassStudents(req.params.id, studentIds || []);
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

// Class Active Sessions
classRouter.get('/sessions', async (_req, res, next) => {
  try {
    const sessions = await ClassService.getAllSessions();
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

classRouter.get('/sessions/:id', async (req, res, next) => {
  try {
    const session = await ClassService.getSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

classRouter.post('/sessions', async (req, res, next) => {
  try {
    const session = await ClassService.createSession(req.body);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

classRouter.post('/sessions/:id/qr', async (req, res, next) => {
  try {
    const qrData = await ClassService.generateSessionQR(req.params.id);
    res.json(qrData);
  } catch (err) {
    next(err);
  }
});
