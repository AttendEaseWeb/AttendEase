import { ClassService } from './class.service';

export class EventService {
  static getAllCourses() {
    return ClassService.getAllClasses();
  }

  static getCourseById(id: string) {
    return ClassService.getClassById(id);
  }

  static createCourse(data: any) {
    return ClassService.createClass(data);
  }

  static updateCourse(id: string, updates: any) {
    return ClassService.updateClass(id, updates);
  }

  static deleteCourse(id: string) {
    return ClassService.deleteClass(id);
  }

  static getAllSessions() {
    return ClassService.getAllSessions();
  }

  static getSessionById(id: string) {
    return ClassService.getSessionById(id);
  }

  static createSession(data: any) {
    return ClassService.createSession(data);
  }

  static generateSessionQR(id: string) {
    return ClassService.generateSessionQR(id);
  }
}
