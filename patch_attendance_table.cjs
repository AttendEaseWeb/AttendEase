const fs = require('fs');
const file = 'src/client/features/attendance/components/AttendanceTable.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add JustificationModal import
content = content.replace(/import \{ Badge \} from "\.\.\/\.\.\/\.\.\/components\/common\/Badge";/, 'import { Badge } from "../../../components/common/Badge";\nimport { JustificationModal } from "./JustificationModal";\nimport { Button } from "../../../components/common/Button";');

// Remove QrCode icon import
content = content.replace(/QrCode,\s*/g, '');

// Add state for JustificationModal
content = content.replace(/const \[statusFilter, setStatusFilter\] = useState<string>\("ALL"\);/, 'const [statusFilter, setStatusFilter] = useState<string>("ALL");\n  const [justificationRecord, setJustificationRecord] = useState<AttendanceRecord | null>(null);');

// Replace Method cell in Desktop
content = content.replace(/\{record\.method === "QR_SCAN" \? \([\s\S]*?\) : \([\s\S]*?Manual Override\s*<\/?>\s*\)\}/g, '<><UserCheck className="w-3.5 h-3.5 text-m3-sys-light-tertiary dark:text-m3-sys-dark-tertiary" /> {record.method === "GEO_CHECKIN" ? "Live Check-in" : "Manual Override"}</>');

// Replace Method cell in Mobile
content = content.replace(/\{record\.method === "QR_SCAN" \? \([\s\S]*?\) : \([\s\S]*?Manual\s*<\/?>\s*\)\}/g, '<><UserCheck className="w-3 h-3 text-m3-sys-light-tertiary dark:text-m3-sys-dark-tertiary" /> {record.method === "GEO_CHECKIN" ? "Live" : "Manual"}</>');

// Add Justification column header to Desktop
content = content.replace(/<th className="p-4 text-left font-bold text-label-large">Status<\/th>/, '<th className="p-4 text-left font-bold text-label-large">Status</th>\n                <th className="p-4 text-left font-bold text-label-large">Actions</th>');

// Add Justification column cell to Desktop
content = content.replace(/<\/Badge>\s*<\/td>\s*<\/tr>/g, `</Badge>
                      </td>
                      <td className="p-4">
                        {record.status === "ABSENT" && !record.justificationStatus && (
                           <Button size="sm" variant="outline" onClick={() => setJustificationRecord(record)}>
                             {user?.role === "STUDENT" ? "Justify Absence" : "Review"}
                           </Button>
                        )}
                        {record.justificationStatus && (
                           <Button size="sm" variant="outline" onClick={() => setJustificationRecord(record)}>
                             {record.justificationStatus === "PENDING" ? "Pending Review" : record.justificationStatus}
                           </Button>
                        )}
                      </td>
                    </tr>`);

// Add Justification cell to Mobile
content = content.replace(/<\/Badge>\s*<\/div>\s*<div className="grid grid-cols-2/g, `</Badge>
                  </div>
                  {(record.status === "ABSENT" || record.justificationStatus) && (
                     <div className="pt-2 border-t border-m3-sys-light-outline-variant/30">
                        <Button size="sm" variant="outline" className="w-full" onClick={() => setJustificationRecord(record)}>
                           {!record.justificationStatus ? (user?.role === "STUDENT" ? "Justify Absence" : "Review") : record.justificationStatus === "PENDING" ? "Pending Review" : record.justificationStatus}
                        </Button>
                     </div>
                  )}
                  <div className="grid grid-cols-2`);

// Add JustificationModal component render before closing </div> of component
content = content.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};\s*)$/, `
      <JustificationModal 
        isOpen={!!justificationRecord} 
        onClose={() => setJustificationRecord(null)} 
        record={justificationRecord} 
        onSuccess={() => {
          setJustificationRecord(null);
          // Assuming parent handles re-fetching or we wait for a refresh
          if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('attendance-updated'));
        }} 
      />
$1`);

fs.writeFileSync(file, content);
console.log('patched attendance table');
