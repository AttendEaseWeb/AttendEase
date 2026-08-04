import { Router } from 'express';
import { EventService } from '../services/event.service';

export const eventRouter = Router();

// Courses
eventRouter.get('/courses', (_req, res, next) => {
  try {
    const courses = EventService.getAllCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

eventRouter.get('/courses/:id', (req, res, next) => {
  try {
    const course = EventService.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    next(err);
  }
});

eventRouter.post('/courses', (req, res, next) => {
  try {
    const course = EventService.createCourse(req.body);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
});

eventRouter.put('/courses/:id', (req, res, next) => {
  try {
    const course = EventService.updateCourse(req.params.id, req.body);
    res.json(course);
  } catch (err) {
    next(err);
  }
});

eventRouter.delete('/courses/:id', (req, res, next) => {
  try {
    const success = EventService.deleteCourse(req.params.id);
    res.json({ success });
  } catch (err) {
    next(err);
  }
});

// Sessions
eventRouter.get('/sessions', (_req, res, next) => {
  try {
    const sessions = EventService.getAllSessions();
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

eventRouter.get('/sessions/:id', (req, res, next) => {
  try {
    const session = EventService.getSessionById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
});

eventRouter.post('/sessions', (req, res, next) => {
  try {
    const session = EventService.createSession(req.body);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

eventRouter.post('/sessions/:id/qr', (req, res, next) => {
  try {
    const qrData = EventService.generateSessionQR(req.params.id);
    res.json(qrData);
  } catch (err) {
    next(err);
  }
});
