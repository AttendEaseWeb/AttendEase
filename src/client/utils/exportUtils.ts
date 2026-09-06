import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord } from '../../shared/types/attendance';

export const exportToExcel = (records: AttendanceRecord[], filename: string = 'Attendance_Report') => {
  const worksheetData = records.map(r => ({
    'Student Name': r.studentName,
    'Email': r.studentEmail,
    'Course': r.courseCode,
    'Check-In Time': new Date(r.checkInTime).toLocaleString(),
    'Status': r.status,
    'Method': r.method
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  // Fix column widths
  const max_width = worksheetData.reduce((w, r) => Math.max(w, r['Student Name'].length), 15);
  worksheet['!cols'] = [ { wch: max_width }, { wch: 25 }, { wch: 15 }, { wch: 22 }, { wch: 12 }, { wch: 12 } ];

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToPDF = (records: AttendanceRecord[], filename: string = 'Attendance_Report') => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('AttendEase - Attendance Report', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  const tableColumn = ["Student Name", "Email", "Course", "Check-In Time", "Status", "Method"];
  const tableRows = records.map(r => [
    r.studentName,
    r.studentEmail,
    r.courseCode,
    new Date(r.checkInTime).toLocaleString(),
    r.status,
    r.method
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 133, 244] }, // A nice blue header
    alternateRowStyles: { fillColor: [245, 247, 250] }
  });

  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};
