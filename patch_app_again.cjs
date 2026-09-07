const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update AttendancePage usage
content = content.replace(/<AttendancePage \/>/g, '<AttendancePage />'); // just to be safe
content = content.replace(/<AttendancePage onOpenQRScanner=\{\(\) => setIsQRModalOpen\(true\)\} \/>/g, '<AttendancePage />');
content = content.replace(/<AttendancePage onOpenQRScanner=\{\(\) => \{\}\} \/>/g, '<AttendancePage />'); // in case it was left over

fs.writeFileSync(file, content);
console.log('patched app again');
