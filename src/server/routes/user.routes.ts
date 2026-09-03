import { Router } from 'express';
import { UserService } from '../services/user.service';
import { dbStore } from '../db/store';
import { User } from '../../shared/types/auth';

export const userRouter = Router();

userRouter.get('/', async (_req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

userRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

userRouter.post('/', async (req, res, next) => {
  try {
    const { name, email, parentPhone, parentEmail, role, studentId, department, avatarUrl } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full Name is required' });
    }

    const cleanStudentId = studentId ? studentId.trim() : `STU-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Auto-generate unique email if omitted
    let effectiveEmail = email ? email.trim().toLowerCase() : '';
    if (!effectiveEmail) {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      effectiveEmail = `${slug}.${cleanStudentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@school.edu.ph`;
    }

    const existing = await dbStore.getUserByEmail(effectiveEmail);
    if (existing) {
      // Add random salt if duplicate email generated
      effectiveEmail = `${effectiveEmail.split('@')[0]}_${Math.floor(100 + Math.random() * 900)}@school.edu.ph`;
    }

    const newUser: User = {
      id: req.body.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: effectiveEmail,
      parentPhone: parentPhone ? parentPhone.trim() : undefined,
      parentEmail: parentEmail ? parentEmail.trim() : undefined,
      role: role || 'STUDENT',
      studentId: cleanStudentId,
      department: department || 'General Education',
      avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    const created = await UserService.createUser(newUser);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

userRouter.delete('/:id', async (req, res, next) => {
  try {
    const success = await dbStore.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});
