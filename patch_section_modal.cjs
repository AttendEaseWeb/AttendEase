const fs = require('fs');
const file = 'src/client/features/events/components/SectionDetailModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove prop onLaunchQRModal
content = content.replace(/\s+onLaunchQRModal: \(session: ClassSession\) => void;\n/, '');
content = content.replace(/\s+onLaunchQRModal,\n/, '');

// Change toast
content = content.replace(/showToast\(\`Live QR Session launched for \$\{subjectName\}\!\`, "success"\);/g, 'showToast(`Live Session launched for ${subjectName}!`, "success");');
content = content.replace(/\s+onLaunchQRModal\(createdSession\);\n/, '');

content = content.replace(/Choose a subject to launch QR attendance, review roster/g, 'Choose a subject to manage attendance, review roster');
content = content.replace(/title="Active QR Session Live!"/g, 'title="Active Session Live!"');
content = content.replace(/Live QR Session Active/g, 'Live Session Active');
content = content.replace(/Launch a live QR attendance session for students in this/g, 'Launch a live attendance session for students in this');

// Remove "Display Live QR Code" button
content = content.replace(/<Button\s+size="sm"\s+variant="primary"\s+onClick=\{\(\) => onLaunchQRModal\(sess\)\}\s+>\s+Display Live QR Code\s+<\/Button>/g, '');

fs.writeFileSync(file, content);
console.log('patched section modal');
