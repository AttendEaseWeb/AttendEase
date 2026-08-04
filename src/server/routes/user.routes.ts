import { Router } from 'express';
import { UserService } from '../services/user.service';

export const userRouter = Router();

userRouter.get('/', (_req, res, next) => {
  try {
    const users = UserService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

userRouter.get('/:id', (req, res, next) => {
  try {
    const user = UserService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
