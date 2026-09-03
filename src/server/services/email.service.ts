import nodemailer from 'nodemailer';
import { AttendanceRecord } from '../../shared/types/attendance';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  static async sendParentNotification(
    parentEmail: string,
    studentName: string,
    record: AttendanceRecord
  ): Promise<boolean> {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('Gmail credentials not set in environment variables. Email not sent.');
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

      const mailOptions = {
        from: `"AttendEase Notifications" <${process.env.GMAIL_USER}>`,
        to: parentEmail,
        subject: `Attendance Alert: ${studentName} marked Absent`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">Attendance Notification</h2>
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear Parent/Guardian,</p>
              <p>This is an automated notification from <strong>AttendEase</strong> to inform you that <strong>${studentName}</strong> was marked <strong>ABSENT</strong>.</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Class/Subject:</strong> ${record.subject} (${record.sectionName})</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${dateString}</p>
                <p style="margin: 5px 0;"><strong>Time Marked:</strong> ${timeString}</p>
                ${record.notes ? `<p style="margin: 5px 0;"><strong>Instructor Notes:</strong> ${record.notes}</p>` : ''}
              </div>
              
              <p>If you believe this is an error, please contact the instructor or the school administration office.</p>
              <br/>
              <p>Sincerely,</p>
              <p><strong>The AttendEase Team</strong></p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Successfully sent absence notification to ${parentEmail} for ${studentName}`);
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }
}
