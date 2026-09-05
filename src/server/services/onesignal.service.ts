import { AttendanceRecord } from '../../shared/types/attendance';

export class OneSignalService {
  static async sendAbsencePushNotification(
    parentEmail: string,
    studentName: string,
    record: AttendanceRecord
  ): Promise<boolean> {
    const appId = process.env.VITE_ONESIGNAL_APP_ID;
    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !restApiKey) {
      console.warn('OneSignal credentials not set. Push notification skipped.');
      return false;
    }

    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${restApiKey}`
        },
        body: JSON.stringify({
          app_id: appId,
          // Target the parent by the alias we set in the frontend (their email)
          include_aliases: {
            external_id: [parentEmail]
          },
          target_channel: "push",
          headings: { "en": "Attendance Alert" },
          contents: { "en": `${studentName} was marked ABSENT for ${record.subject}.` }
        })
      });

      const data = await response.json();
      
      if (!response.ok || data.errors) {
        console.error('OneSignal push error:', data);
        return false;
      }

      console.log(`Successfully sent OneSignal push notification to ${parentEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send OneSignal push notification:', error);
      return false;
    }
  }
}
