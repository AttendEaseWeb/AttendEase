import { User } from '../../shared/types/auth';
import { dbStore } from '../db/store';

export class UserService {
  static getAllUsers(): User[] {
    return dbStore.getUsers();
  }

  static getUserById(id: string): User | undefined {
    return dbStore.getUserById(id);
  }

  static createUser(user: User): User {
    return dbStore.addUser(user);
  }
}
