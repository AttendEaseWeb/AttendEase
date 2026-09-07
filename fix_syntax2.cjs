const fs = require('fs');

function fixClassCard() {
  const file = 'src/client/features/events/components/ClassCard.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/icon=\{\s*\}/g, '');
  fs.writeFileSync(file, content);
}

function fixSectionDetailModal() {
  const file = 'src/client/features/events/components/SectionDetailModal.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/icon=\{\s*\}/g, '');
  content = content.replace(/<QrCode[^>]*\/>/g, ''); // Just in case
  fs.writeFileSync(file, content);
}

function fixDashboard() {
  const file = 'src/client/features/dashboard/pages/DashboardPage.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  // Actually, wait, let's fix the start tag.
  // We deleted `{user?.role === "STUDENT" ? "Scan Class QR Code" : "Display Live QR"}</Button>`
  // But left `<Button id="dashboard-quick-checkin-btn" ... >`
  // Let's just remove the entire button.
  content = content.replace(/<Button\s+id="dashboard-quick-checkin-btn"[\s\S]*?>[\s\S]*?<\/div>/g, '</div>');
  
  // In DashboardPage, I might have messed up the div. Let's be careful.
  fs.writeFileSync(file, content);
}

fixClassCard();
fixSectionDetailModal();
fixDashboard();
