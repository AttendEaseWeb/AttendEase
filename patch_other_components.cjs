const fs = require('fs');

function patchDashboard() {
  const file = 'src/client/features/dashboard/pages/DashboardPage.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/,\s*QrCode/g, '');
  content = content.replace(/\s+onOpenQRScanner: \(\) => void;\n/, '');
  content = content.replace(/\s+onOpenQRScanner,\n/, '');
  content = content.replace(/class sections, launch live QR check-ins, and monitor student/g, 'class sections, launch live sessions, and monitor student');
  
  // Quick action button
  content = content.replace(/<Button\s+variant="primary"\s+onClick=\{onOpenQRScanner\}\s+icon=\{<QrCode className="w-5 h-5" \/>\}\s+className="w-full sm:w-auto font-bold shadow-md shadow-m3-sys-light-primary\/20"\s+>\s+\{user\.role === "STUDENT"\s+\? "Scan Class QR Code"\s+: "Display Live QR"\}\s+<\/Button>/g, '');

  // Session pill button
  content = content.replace(/<button\s+onClick=\{onOpenQRScanner\}\s+className="px-3 py-1 rounded-full text-body-small font-bold bg-m3-sys-light-primary text-m3-sys-light-on-primary dark:bg-m3-sys-dark-primary dark:text-m3-sys-dark-on-primary hover:opacity-90 shadow-sm"\s+>\s+\{user\.role === "STUDENT"\s+\? "Check In"\s+: "Active QR"\}\s+<\/button>/g, '');

  fs.writeFileSync(file, content);
}

function patchRecentActivity() {
  const file = 'src/client/features/dashboard/components/RecentActivityList.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/QrCode,\s*/g, '');
  content = content.replace(/\{record\.method === "QR_SCAN" \? \(\n\s+<QrCode className="w-4 h-4" \/>\n\s+\) : \(\n\s+<UserCheck className="w-4 h-4" \/>\n\s+\)\}/g, '<UserCheck className="w-4 h-4" />');
  fs.writeFileSync(file, content);
}

function patchNavbar() {
  const file = 'src/client/components/layout/Navbar.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/QrCode,\s*/g, '');
  content = content.replace(/\s+onOpenQRScanner\?: \(\) => void;\n/, '');
  content = content.replace(/\s+onOpenQRScanner,\n/, '');
  // Not used anywhere else in Navbar according to grep? Oh wait, grep didn't show usages. Let's see if there are other QrCode usages.
  fs.writeFileSync(file, content);
}

function patchAuthPage() {
  const file = 'src/client/features/auth/pages/AuthPage.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Dynamic QR verification, session attendance management, and/g, 'Session attendance management and');
  fs.writeFileSync(file, content);
}

patchDashboard();
patchRecentActivity();
patchNavbar();
patchAuthPage();
console.log('patched other components');
