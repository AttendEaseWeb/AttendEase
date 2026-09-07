const fs = require('fs');
const file = 'src/client/features/attendance/pages/AttendancePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove prop
content = content.replace(/interface AttendancePageProps \{\n\s+onOpenQRScanner: \(\) => void;\n\}\n\nexport const AttendancePage: React.FC<AttendancePageProps> = \(\{\n\s+onOpenQRScanner,\n\}\) => \{/g, 'export const AttendancePage: React.FC = () => {');
content = content.replace(/import \{[\s\S]*?QrCode,[\s\S]*?\} from "lucide-react";/g, 'import {\n  Download,\n  Plus,\n  RefreshCw,\n  FileSpreadsheet,\n  FileText,\n} from "lucide-react";');

// Add event listener
content = content.replace(/useEffect\(\(\) => \{\n\s+fetchRecords\(\);\n\s+\}, \[user\]\);/g, `useEffect(() => {
    fetchRecords();
    const handleUpdate = () => fetchRecords();
    window.addEventListener('attendance-updated', handleUpdate);
    return () => window.removeEventListener('attendance-updated', handleUpdate);
  }, [user]);`);

// Remove Scan QR button
content = content.replace(/\{user\?\.role === "STUDENT" && \(\n\s+<Button\n\s+size="sm"\n\s+onClick=\{onOpenQRScanner\}\n\s+icon=\{<QrCode className="w-3\.5 h-3\.5" \/>\}\n\s+>\n\s+Scan Check-in\n\s+<\/Button>\n\s+\)\}/g, '');

fs.writeFileSync(file, content);
console.log('patched attendance page');
