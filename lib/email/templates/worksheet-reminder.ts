export interface WorksheetReminderEmailData {
  studentName: string;
  worksheetTitle: string;
  dueDate: string; // pre-formatted string
  dueIn: string; // e.g. "4 hours" or "1 day"
  assignmentId: string;
  templateId: string;
  platformUrl?: string;
}

export function renderWorksheetReminderHtml(data: WorksheetReminderEmailData): string {
  const url = data.platformUrl ?? "https://incubator.nexhunt.xyz";
  const worksheetUrl = `${url}/student/worksheets/${data.templateId}?assignment=${data.assignmentId}`;
  const firstName = data.studentName.split(" ")[0] ?? data.studentName;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Worksheet Reminder</title>
  <style>
    body { margin: 0; padding: 0; background: #0A0F1E; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #E2E8F0; }
    .container { max-width: 600px; margin: 0 auto; background: #0D1326; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); padding: 40px; text-align: center; }
    .logo { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .tagline { font-size: 13px; color: rgba(255,255,255,0.9); margin-top: 6px; font-weight: 600; }
    .body { padding: 40px; }
    .greeting { font-size: 20px; font-weight: 700; color: #E2E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #CBD5E0; margin-bottom: 16px; }
    .card { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 24px; margin: 24px 0; }
    .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(245,158,11,0.7); margin-bottom: 4px; }
    .card-value { font-size: 16px; font-weight: 600; color: #E2E8F0; }
    .due-row { display: flex; align-items: center; gap: 8px; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
    .due-label { font-size: 13px; color: rgba(255,255,255,0.5); }
    .due-value { font-size: 13px; font-weight: 700; color: #F59E0B; }
    .cta { margin: 32px 0 0; text-align: center; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: #fff; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 10px; text-decoration: none; }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; }
    .footer a { color: rgba(255,255,255,0.4); text-decoration: none; }
  </style>
</head>
<body>
  <div style="padding: 24px 16px;">
    <div class="container">
      <div class="header">
        <div class="logo">CAS Incubator OS</div>
        <div class="tagline">Worksheet Due in ${data.dueIn}</div>
      </div>
      <div class="body">
        <p class="greeting">Reminder, ${firstName}!</p>
        <p class="text">
          You have a worksheet due soon. Don't forget to complete and submit it before the deadline.
        </p>
        <div class="card">
          <div class="card-label">Worksheet</div>
          <div class="card-value">${data.worksheetTitle}</div>
          <div class="due-row">
            <span class="due-label">Due:</span>
            <span class="due-value">${data.dueDate} (in ${data.dueIn})</span>
          </div>
        </div>
        <div class="cta">
          <a href="${worksheetUrl}">Complete Worksheet Now</a>
        </div>
      </div>
      <div class="footer">
        <p>
          You received this reminder from
          <a href="${url}">incubator.nexhunt.xyz</a>.
        </p>
        <p style="margin-top:8px;">© ${new Date().getFullYear()} CAS Incubator OS. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function renderWorksheetReminderText(data: WorksheetReminderEmailData): string {
  const url = data.platformUrl ?? "https://incubator.nexhunt.xyz";
  const worksheetUrl = `${url}/student/worksheets/${data.templateId}?assignment=${data.assignmentId}`;
  const firstName = data.studentName.split(" ")[0] ?? data.studentName;

  return `Reminder, ${firstName}!

You have a worksheet due in ${data.dueIn}.

Worksheet: ${data.worksheetTitle}
Due: ${data.dueDate}

Complete it here: ${worksheetUrl}

---
© ${new Date().getFullYear()} CAS Incubator OS · incubator.nexhunt.xyz
`;
}
