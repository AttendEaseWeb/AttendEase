const fs = require('fs');
const file = 'src/server/services/attendance.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Remove import { parseQRToken } from "../../shared/utils/qr";
content = content.replace(/import \{ parseQRToken \} from "\.\.\/\.\.\/shared\/utils\/qr";\n?/, '');

// Remove QR verification block
content = content.replace(/\/\/ Verify QR token if provided[\s\S]*?(?=let status: AttendanceStatus = "PRESENT";)/, '');

// Update method
content = content.replace(/method: req\.qrToken \? "QR_SCAN" : "GEO_CHECKIN",/g, 'method: "GEO_CHECKIN",');

// Add Justification methods
const methods = `
  static async submitJustification(data: { recordId: string; justification: string }): Promise<AttendanceRecord> {
    const record = await dbStore.getAttendanceRecordById(data.recordId);
    if (!record) throw new Error("Record not found");
    record.justification = data.justification;
    record.justificationStatus = "PENDING";
    return await dbStore.updateAttendanceRecord(record);
  }

  static async resolveJustification(data: { recordId: string; status: "APPROVED" | "REJECTED" }): Promise<AttendanceRecord> {
    const record = await dbStore.getAttendanceRecordById(data.recordId);
    if (!record) throw new Error("Record not found");
    record.justificationStatus = data.status;
    if (data.status === "APPROVED") {
      record.status = "EXCUSED";
    }
    return await dbStore.updateAttendanceRecord(record);
  }
`;

content = content.replace(/static async getStats/, methods + '\n  static async getStats');
fs.writeFileSync(file, content);
console.log('patched service');
