import { LoginRequest, RegisterRequest, AuthResponse, UserRole } from '../../shared/types/auth';
import { dbStore } from '../db/store';

export class AuthService {
  static async login(req: LoginRequest): Promise<AuthResponse> {
    let user = await dbStore.getUserByEmail(req.email);

    if (!user) {
      // Auto register for seamless testing if role provided
      const role: UserRole = req.role || 'STUDENT';
      const name = req.email.split('@')[0].replace('.', ' ');
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

      user = await dbStore.addUser({
        id: `u-${Date.now()}`,
        email: req.email,
        name: capitalizedName,
        role,
        department: 'Computer Science',
        studentId: role === 'STUDENT' ? `ST-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        createdAt: new Date().toISOString(),
      });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    return {
      user,
      token,
    };
  }

  static async register(req: RegisterRequest): Promise<AuthResponse> {
    const existing = await dbStore.getUserByEmail(req.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const user = await dbStore.addUser({
      id: `u-${Date.now()}`,
      name: req.name,
      email: req.email,
      role: req.role,
      department: req.department || 'Computer Science',
      studentId: req.studentId || (req.role === 'STUDENT' ? `ST-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      createdAt: new Date().toISOString(),
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    return { user, token };
  }
}
