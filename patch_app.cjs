const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove import
content = content.replace(/import \{ QRCheckInModal \} from "\.\/client\/features\/attendance\/components\/QRCheckInModal";\n/, '');

// Remove state
content = content.replace(/const \[isQRModalOpen, setIsQRModalOpen\] = useState\(false\);\n/, '');

// Remove props
content = content.replace(/\s+onOpenQRScanner=\{\(\) => setIsQRModalOpen\(true\)\}/g, '');

// Remove component
content = content.replace(/\{\/\* Global Live QR Code Check-In Modal \*\/\}\n\s+<QRCheckInModal\n\s+isOpen=\{isQRModalOpen\}\n\s+onClose=\{\(\) => setIsQRModalOpen\(false\)\}\n\s+\/>\n/g, '');

fs.writeFileSync(file, content);
console.log('patched app');
