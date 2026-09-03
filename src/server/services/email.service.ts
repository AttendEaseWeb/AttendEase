import emailjs from '@emailjs/nodejs';
import { AttendanceRecord } from '../../shared/types/attendance';

export class EmailService {
  static async sendParentNotification(
    parentEmail: string,
    studentName: string,
    record: AttendanceRecord
  ): Promise<boolean> {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      console.warn('EmailJS credentials not set in environment variables. Email not sent.');
      return false;
    }

    try {
      const dateString = new Date(record.checkInTime).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const timeString = new Date(record.checkInTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const templateParams = {
        to_email: parentEmail,
        student_name: studentName,
        class_subject: record.subject,
        class_section: record.sectionName,
        date_string: dateString,
        time_string: timeString,
        notes: record.notes || 'None',
      };

      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        {
          publicKey: publicKey,
          privateKey: privateKey,
        }
      );

      console.log(`Successfully sent EmailJS absence notification to ${parentEmail} for ${studentName}`);
      return true;
    } catch (error) {
      console.warn('Primary EmailJS account failed (possibly quota exceeded):', error);

      // Attempt backup account
      const backupServiceId = process.env.EMAILJS_SERVICE_ID_BACKUP;
      const backupTemplateId = process.env.EMAILJS_TEMPLATE_ID_BACKUP;
      const backupPublicKey = process.env.EMAILJS_PUBLIC_KEY_BACKUP;
      const backupPrivateKey = process.env.EMAILJS_PRIVATE_KEY_BACKUP;

      if (backupServiceId && backupTemplateId && backupPublicKey && backupPrivateKey) {
        console.log('Attempting to send via backup EmailJS account...');
        try {
          await emailjs.send(
            backupServiceId,
            backupTemplateId,
            templateParams,
            {
              publicKey: backupPublicKey,
              privateKey: backupPrivateKey,
            }
          );
          console.log(`Successfully sent backup EmailJS notification to ${parentEmail} for ${studentName}`);
          return true;
        } catch (backupError) {
          console.error('Failed to send backup EmailJS notification:', backupError);
          return false;
        }
      }

      return false;
    }
  }
}
