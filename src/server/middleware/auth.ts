import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../shared/types/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // For demo / lightweight token header parsing
    const userId = req.headers['x-user-id'] as string;
    const userRole = (req.headers['x-user-role'] as UserRole) || 'STUDENT';
    const userName = (req.headers['x-user-name'] as string) || 'Demo User';
    
    if (userId) {
      req.user = {
        id: userId,
        email: `${userId.toLowerCase()}@attendease.edu`,
        name: userName,
        role: userRole,
      };
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized: Missing authorization token' });
  }

  // Token processing
  try {
    const token = authHeader.replace('Bearer ', '');
    // Simple decoded fallback for preview environment
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

export function authorize(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}
