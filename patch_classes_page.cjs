const fs = require('fs');
const file = 'src/client/features/events/pages/ClassesPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove QR imports
content = content.replace(/import \{ QRCheckInModal \} from "\.\.\/\.\.\/attendance\/components\/QRCheckInModal";\n/, '');

// Remove QRCheckInModal state and usage
content = content.replace(/const \[isQRModalOpen, setIsQRModalOpen\] = useState\(false\);\n/, '');
content = content.replace(/const handleLaunchQRFromSection = \(_session: ClassSession\) => \{\n\s+setIsQRModalOpen\(true\);\n\s+\};\n/, '');

// Remove prop onOpenQRScanner
content = content.replace(/\s+onOpenQRScanner: \(\) => void;\n/, '');
content = content.replace(/\s+onOpenQRScanner,\n/, '');
content = content.replace(/\s+onLaunchQRModal=\{handleLaunchQRFromSection\}\n/, '');

// Remove "Show Live QR Code" button from Active Sessions Tab
content = content.replace(/<Button\s+variant="primary"\s+onClick=\{onOpenQRScanner\}\s+size="sm"\s+>\s+\{s\.status === "ACTIVE" \? "Show Live QR Code" : "View Token"\}\s+<\/Button>/g, '');

// Remove the QRCheckInModal component render
content = content.replace(/\{\/\* Dynamic QR Check-in Modal \*\/\}\n\s+<QRCheckInModal\s+isOpen=\{isQRModalOpen\}\s+onClose=\{\(\) => \{\n\s+setIsQRModalOpen\(false\);\n\s+fetchData\(\);\n\s+\}\}\s+\/>\n/g, '');

// Update subtitle
content = content.replace(/subtitle="Live dynamic QR attendance check-in checkpoints for registered class sections"/g, 'subtitle="Manage attendance for active sessions"');
content = content.replace(/Click "Launch QR Attendance" on any/g, 'Start a session on any');

fs.writeFileSync(file, content);
console.log('patched classes page');
