const fs = require('fs');
const file = 'src/server/services/class.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Remove import { generateDynamicQRToken } from "../../shared/utils/qr";
content = content.replace(/import \{ generateDynamicQRToken \} from "\.\.\/\.\.\/shared\/utils\/qr";\n?/, '');

// Remove QR token logic in startSession
content = content.replace(/const qrData = generateDynamicQRToken\(session\.id, session\.classCode \|\| session\.classId\);/, '');
content = content.replace(/session\.qrToken = qrData\.token;/, '');
content = content.replace(/session\.qrExpiresAt = qrData\.expiresAt;/, '');

fs.writeFileSync(file, content);
console.log('patched class service');
