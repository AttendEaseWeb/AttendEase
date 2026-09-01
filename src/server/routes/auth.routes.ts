import { Router } from 'express';
import { AuthService } from '../services/auth.service';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    const result = await AuthService.login({ email, password, role });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, role, department, studentId } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }
    const result = await AuthService.register({ name, email, role, department, studentId });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
