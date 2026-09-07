const fs = require('fs');
const file = 'src/server/db/store.ts';
let content = fs.readFileSync(file, 'utf8');

const methods = `
  async getAttendanceRecordById(id: string): Promise<AttendanceRecord | null> {
    const record = this.data.attendance.find((a) => a.id === id) || null;
    return record;
  }

  async updateAttendanceRecord(record: AttendanceRecord): Promise<AttendanceRecord> {
    const index = this.data.attendance.findIndex((a) => a.id === record.id);
    if (index === -1) {
      throw new Error("Attendance record not found");
    }
    this.data.attendance[index] = { ...this.data.attendance[index], ...record };
    await this.persist();
    return this.data.attendance[index];
  }
`;

if (!content.includes('getAttendanceRecordById')) {
  content = content.replace(/async getAttendanceBySessionId/, methods + '\n  async getAttendanceBySessionId');
  fs.writeFileSync(file, content);
  console.log('patched store');
} else {
  console.log('store already has getAttendanceRecordById');
}
