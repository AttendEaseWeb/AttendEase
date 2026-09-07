const fs = require('fs');
let content = fs.readFileSync('src/client/features/attendance/pages/AttendancePage.tsx', 'utf8');

const imports = `import React, { useEffect, useState } from "react";
import { offlineCapableFetch } from "../../../utils/sync";
import { AttendanceRecord } from "../../../../shared/types/attendance";
import { AttendanceTable } from "../components/AttendanceTable";
import { ManualCheckInModal } from "../components/ManualCheckInModal";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { useAuth } from "../../../context/AuthContext";
import { useNotification } from "../../../context/NotificationContext";
`;

if (!content.includes('import React')) {
  content = imports + content;
}

fs.writeFileSync('src/client/features/attendance/pages/AttendancePage.tsx', content);
console.log('Fixed imports in AttendancePage');
