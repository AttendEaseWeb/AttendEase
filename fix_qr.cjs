const fs = require('fs');

function fixClassesPage() {
  const file = 'src/client/features/events/pages/ClassesPage.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ QRCheckInModal \} from "\.\.\/\.\.\/attendance\/components\/QRCheckInModal";\n?/g, '');
  content = content.replace(/const \[isQRModalOpen, setIsQRModalOpen\] = useState\(false\);\n?/g, '');
  content = content.replace(/onOpenQRScanner: \(\) => void;\n?/g, '');
  content = content.replace(/onOpenQRScanner,\n?/g, '');
  content = content.replace(/onLaunchQRModal=\{handleLaunchQRFromSection\}\n?/g, '');
  
  // Replace the button
  content = content.replace(/<Button\s+variant="primary"\s+onClick=\{onOpenQRScanner\}\s+size="sm"\s*>\s*\{s\.status === "ACTIVE" \? "Show Live QR Code" : "View Token"\}\s*<\/Button>/g, '');
  
  // Replace the modal
  content = content.replace(/\{\/\* Dynamic QR Check-in Modal \*\/\}\s*<QRCheckInModal\s*isOpen=\{isQRModalOpen\}\s*onClose=\{\(\) => \{\s*setIsQRModalOpen\(false\);\s*fetchData\(\);\s*\}\}\s*\/>/g, '');

  content = content.replace(/<QrCode className="w-4 h-4" \/>/g, '');
  content = content.replace(/QrCode,/g, '');

  fs.writeFileSync(file, content);
}

function fixSectionDetailModal() {
  const file = 'src/client/features/events/components/SectionDetailModal.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/onLaunchQRModal: \(session: ClassSession\) => void;\n?/g, '');
  content = content.replace(/onLaunchQRModal,\n?/g, '');
  
  content = content.replace(/<Button\s*size="sm"\s*variant="primary"\s*onClick=\{\(\) => onLaunchQRModal\(sess\)\}\s*>\s*Display Live QR Code\s*<\/Button>/g, '');

  content = content.replace(/<QrCode className="w-4 h-4" \/>/g, '');
  content = content.replace(/<QrCode className="w-3\.5 h-3\.5" \/>/g, '');
  content = content.replace(/<QrCode className="w-10 h-10 mx-auto text-m3-sys-light-on-surface-variant\/50" \/>/g, '');
  content = content.replace(/QrCode,/g, '');
  
  fs.writeFileSync(file, content);
}

function fixClassCard() {
  const file = 'src/client/features/events/components/ClassCard.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<QrCode className=\{!onSelectClass \? "w-5 h-5" : "w-3\.5 h-3\.5"\} \/>/g, '');
  content = content.replace(/QrCode,/g, '');
  fs.writeFileSync(file, content);
}

function fixDashboard() {
  const file = 'src/client/features/dashboard/pages/DashboardPage.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/onOpenQRScanner: \(\) => void;\n?/g, '');
  content = content.replace(/onOpenQRScanner,\n?/g, '');
  
  // replace button
  content = content.replace(/<Button\s*variant="primary"\s*onClick=\{onOpenQRScanner\}\s*icon=\{<QrCode className="w-5 h-5" \/>\}\s*className="w-full sm:w-auto font-bold shadow-md shadow-m3-sys-light-primary\/20"\s*>\s*\{user\.role === "STUDENT"\s*\? "Scan Class QR Code"\s*: "Display Live QR"\}\s*<\/Button>/g, '');
  
  content = content.replace(/<button\s*onClick=\{onOpenQRScanner\}\s*className="px-3 py-1 rounded-full text-body-small font-bold bg-m3-sys-light-primary text-m3-sys-light-on-primary dark:bg-m3-sys-dark-primary dark:text-m3-sys-dark-on-primary hover:opacity-90 shadow-sm"\s*>\s*\{user\.role === "STUDENT"\s*\? "Check In"\s*: "Active QR"\}\s*<\/button>/g, '');
  
  content = content.replace(/QrCode,/g, '');
  fs.writeFileSync(file, content);
}

try {
  fixClassesPage();
  fixSectionDetailModal();
  fixClassCard();
  fixDashboard();
  console.log("Fixed UI components");
} catch(e) {
  console.error(e);
}
