const fs = require('fs');
const file = 'src/server/routes/attendance.routes.ts';
let content = fs.readFileSync(file, 'utf8');

// Remove qrToken
content = content.replace(/qrToken,/g, '');
content = content.replace(/qrToken\s*}/g, '}');

// Add Justification routes
content += `
attendanceRouter.post("/justification", async (req, res, next) => {
  try {
    const { recordId, justification } = req.body;
    if (!recordId || !justification) {
      return res.status(400).json({ error: "Record ID and Justification are required" });
    }
    const record = await AttendanceService.submitJustification({ recordId, justification });
    res.json(record);
  } catch (err) {
    next(err);
  }
});

attendanceRouter.post("/justification/resolve", async (req, res, next) => {
  try {
    const { recordId, status } = req.body;
    if (!recordId || !status) {
      return res.status(400).json({ error: "Record ID and Status are required" });
    }
    const record = await AttendanceService.resolveJustification({ recordId, status });
    res.json(record);
  } catch (err) {
    next(err);
  }
});
`;

fs.writeFileSync(file, content);
console.log('patched');
