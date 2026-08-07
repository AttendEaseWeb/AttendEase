import { Router } from 'express';
import { ClassService } from '../services/class.service';

export const classRouter = Router();

// Classes / Class Sections
classRouter.get('/classes', (_req, res, next) => {
  try {
    const classes = ClassService.getAllClasses();
    res.json(classes);
  } catch (err) {
    next(err);
  }
});

classRouter.get('/classes/:id', (req, res, next) => {
  try {
    const cls = ClassService.getClassById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class section not found' });
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.post('/classes', (req, res, next) => {
  try {
    const cls = ClassService.createClass(req.body);
    res.status(201).json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.put('/classes/:id', (req, res, next) => {
  try {
    const cls = ClassService.updateClass(req.params.id, req.body);
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.delete('/classes/:id', (req, res, next) => {
  try {
    const success = ClassService.deleteClass(req.params.id);
    res.json({ success });
  } catch (err) {
    next(err);
  }
});

// Student Enrollment Endpoints
classRouter.post('/classes/:id/enroll', (req, res, next) => {
  try {
    const { studentId } = req.body;
    const cls = ClassService.enrollStudent(req.params.id, studentId);
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.post('/classes/:id/unenroll', (req, res, next) => {
  try {
    const { studentId } = req.body;
    const cls = ClassService.removeStudent(req.params.id, studentId);
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

classRouter.put('/classes/:id/students', (req, res, next) => {
  try {
    const { studentIds } = req.body;
    const cls = ClassService.updateClassStudents(req.params.id, studentIds || []);
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

// Class Active Sessions
classRouter.get('/sessions', (_req, res, next) => {
  try {
    const sessions = ClassService.getAllSessions();
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

classRouter.get('/sessions/:id', (req, res, next) => {
  try {
    const session = ClassService.getSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

classRouter.post('/sessions', (req, res, next) => {
  try {
    const session = ClassService.createSession(req.body);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

classRouter.post('/sessions/:id/qr', (req, res, next) => {
  try {
    const qrData = ClassService.generateSessionQR(req.params.id);
    res.json(qrData);
  } catch (err) {
    next(err);
  }
});
