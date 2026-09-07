const fs = require('fs');
let content = fs.readFileSync('src/server/services/attendance.service.ts', 'utf8');

content = content.replace(/await dbStore\.updateAttendanceRecord\(record\);/g, 'await dbStore.updateAttendanceRecord(record.id, record);');

fs.writeFileSync('src/server/services/attendance.service.ts', content);
console.log('Fixed attendance.service.ts usages');
