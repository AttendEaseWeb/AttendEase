const fs = require('fs');
const file = 'src/client/features/attendance/components/AttendanceTable.tsx';
let content = fs.readFileSync(file, 'utf8');

// Need to import useAuth
if (!content.includes('useAuth')) {
    content = content.replace(/import \{ JustificationModal \} from "\.\/JustificationModal";/, 'import { JustificationModal } from "./JustificationModal";\nimport { useAuth } from "../../../context/AuthContext";');
}

// Add user context
content = content.replace(/const AttendanceTable: React\.FC<AttendanceTableProps> = \(\{\s*records,\s*\}\) => \{/, 'const AttendanceTable: React.FC<AttendanceTableProps> = ({ records }) => {\n  const { user } = useAuth();');

fs.writeFileSync(file, content);
console.log('Fixed attendance table');
