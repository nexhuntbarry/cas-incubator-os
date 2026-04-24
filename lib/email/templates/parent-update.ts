export interface ParentUpdateEmailData {
  parentName: string;
  studentName: string;
  updateType: string;
  subject: string;
  body: string;
  platformUrl?: string;
}

export function renderParentUpdateHtml(data: ParentUpdateEmailData): string {
  const url = data.platformUrl ?? "https://incubator.nexhunt.xyz";
  const bodyHtml = data.body.replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #0A0F1E; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #E2E8F0; }
    .container { max-width: 600px; margin: 0 auto; background: #0D1326; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0057FF 0%, #00C9B1 100%); padding: 32px 40px; }
    .logo { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .tagline { font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 4px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 16px; color: #E2E8F0; margin-bottom: 8px; }
    .update-type { display: inline-block; background: rgba(0,87,255,0.15); color: #4D9EFF; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 20px; margin-bottom: 20px; }
    .content { font-size: 15px; line-height: 1.7; color: #CBD5E0; }
    .cta { margin: 32px 0 0; text-align: center; }
    .cta a { display: inline-block; background: #0057FF; color: #fff; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-decoration: none; }
    .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; }
    .footer a { color: rgba(255,255,255,0.4); text-decoration: none; }
  </style>
</head>
<body>
  <div style="padding: 24px 16px;">
    <div class="container">
      <div class="header">
        <div class="logo">CAS Incubator OS</div>
        <div class="tagline">Build Ideas. Shape Projects. Launch Impact.</div>
      </div>
      <div class="body">
        <p class="greeting">Dear ${data.parentName},</p>
        <span class="update-type">${data.updateType.replace(/_/g, " ")}</span>
        <h2 style="font-size:20px;font-weight:700;color:#E2E8F0;margin:0 0 16px;">${data.subject}</h2>
        <div class="content">${bodyHtml}</div>
        <div class="cta">
          <a href="${url}/parent/updates">View in Platform</a>
        </div>
      </div>
      <div class="footer">
        <p>This update is about <strong>${data.studentName}</strong>'s progress in the CAS Incubator program.</p>
        <p style="margin-top:8px;"><a href="${url}">incubator.nexhunt.xyz</a> &nbsp;·&nbsp; <a href="${url}/parent/updates">Your Updates Inbox</a></p>
        <p style="margin-top:12px; color: rgba(255,255,255,0.15);">Made with CAS Incubator OS</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function renderParentUpdateText(data: ParentUpdateEmailData): string {
  const url = data.platformUrl ?? "https://incubator.nexhunt.xyz";
  return `Dear ${data.parentName},

[${data.updateType.replace(/_/g, " ").toUpperCase()}] ${data.subject}

${data.body}

---
This update is about ${data.studentName}'s progress in the CAS Incubator program.
View all updates: ${url}/parent/updates

CAS Incubator OS — Build Ideas. Shape Projects. Launch Impact.
`;
}
