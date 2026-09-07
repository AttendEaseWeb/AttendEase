const fs = require('fs');

function fixClassesPage() {
  const file = 'src/client/features/events/pages/ClassesPage.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix button
  content = content.replace(/<Button\s*size="sm"\s*variant=\{s\.status === "ACTIVE" \? "primary" : "outline"\}\s*icon=\{\}\s*className="rounded-full shadow-expressive-sm"\s*>\s*<\/Button>/g, '');
  
  // Fix remaining props of QRCheckInModal
  content = content.replace(/onClose=\{\(\) => \{\s*\}\}\s*onCheckInSuccess=\{fetchData\}\s*\/>/g, '');

  fs.writeFileSync(file, content);
}

function fixDashboardPage() {
  const file = 'src/client/features/dashboard/pages/DashboardPage.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix button
  content = content.replace(/\{user\?\.role === "STUDENT"\s*<\/Button>/g, '');
  
  // Fix pill button
  content = content.replace(/\{session\.status === "ACTIVE"\s*: "Schedule"\}\s*<\/Button>/g, '{session.status === "ACTIVE" ? "Manage" : "Schedule"}</Button>');

  fs.writeFileSync(file, content);
}

fixClassesPage();
fixDashboardPage();
console.log('Fixed syntax errors');
