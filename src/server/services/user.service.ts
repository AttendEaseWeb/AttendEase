import { User } from '../../shared/types/auth';
import { dbStore } from '../db/store';

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    return await dbStore.getUsers();
  }

  static async getUserById(id: string): Promise<User | undefined> {
    return await dbStore.getUserById(id);
  }

  static async createUser(user: User): Promise<User> {
    return await dbStore.addUser(user);
  }
}
