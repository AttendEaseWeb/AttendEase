const fs = require('fs');
let content = fs.readFileSync('src/server/db/store.ts', 'utf8');

// The second duplicate starts around line 467. I'll just use string replacement.
// Let's replace the first instance and leave the second? 
// Or I can just remove my injected `updateAttendanceRecord` block.
content = content.replace(/async updateAttendanceRecord\(record: AttendanceRecord\): Promise<AttendanceRecord> \{\n\s+const index = this\.data\.attendance\.findIndex\(\(a\) => a\.id === record\.id\);\n\s+if \(index === -1\) \{\n\s+throw new Error\("Attendance record not found"\);\n\s+\}\n\s+this\.data\.attendance\[index\] = \{ \.\.\.this\.data\.attendance\[index\], \.\.\.record \};\n\s+await this\.persist\(\);\n\s+return this\.data\.attendance\[index\];\n\s+\}/, '');

fs.writeFileSync('src/server/db/store.ts', content);
console.log('Fixed store.ts duplicate method');
