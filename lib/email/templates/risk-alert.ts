export interface RiskAlertEmailData {
  recipientName: string;
  studentName: string;
  flagType: string;
  severity: string;
  description: string;
  raisedBy: string;
  platformUrl?: string;
  flagId: string;
}

export function renderRiskAlertHtml(data: RiskAlertEmailData): string {
  const url = data.platformUrl ?? "https://incubator.nexhunt.xyz";
  const severityColor: Record<string, string> = {
    low: "#22C55E",
    medium: "#F59E0B",
    high: "#EF4444",
    critical: "#7C3AED",
  };
  const color = severityColor[data.severity] ?? "#F59E0B";

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <title>Risk Flag Alert — ${data.studentName}</title>
  <style>
    body { margin: 0; padding: 0; background: #0A0F1E; font-family: Arial, sans-serif; color: #E2E8F0; }
    .container { max-width: 600px; margin: 0 auto; background: #0D1326; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
    .header { background: #0D1326; border-bottom: 3px solid ${color}; padding: 28px 40px; }
    .badge { display: inline-block; background: ${color}22; color: ${color}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 20px; border: 1px solid ${color}44; }
    .body { padding: 32px 40px; }
    .detail-row { display: flex; gap: 12px; margin-bottom: 12px; }
    .detail-label { font-size: 12px; color: rgba(255,255,255,0.4); width: 120px; flex-shrink: 0; padding-top: 2px; }
    .detail-value { font-size: 14px; color: #E2E8F0; }
    .desc-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #CBD5E0; }
    .cta { margin-top: 24px; }
    .cta a { display: inline-block; background: ${color}; color: #fff; font-size: 14px; font-weight: 700; padding: 10px 24px; border-radius: 8px; text-decoration: none; }
    .footer { padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div style="padding: 24px 16px;">
    <div class="container">
      <div class="header">
        <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:10px;">CAS Incubator OS — Risk Alert</div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 12px;">Risk Flag: ${data.studentName}</h1>
        <span class="badge">${data.severity.toUpperCase()} SEVERITY</span>
      </div>
      <div class="body">
        <p style="font-size:15px;color:#CBD5E0;">Hello ${data.recipientName}, a new risk flag requires your attention.</p>
        <div class="detail-row"><span class="detail-label">Student</span><span class="detail-value">${data.studentName}</span></div>
        <div class="detail-row"><span class="detail-label">Flag Type</span><span class="detail-value">${data.flagType.replace(/_/g, " ")}</span></div>
        <div class="detail-row"><span class="detail-label">Severity</span><span class="detail-value" style="color:${color};font-weight:600;">${data.severity.toUpperCase()}</span></div>
        <div class="detail-row"><span class="detail-label">Raised By</span><span class="detail-value">${data.raisedBy}</span></div>
        <div class="desc-box">${data.description}</div>
        <div class="cta">
          <a href="${url}/admin/risks/${data.flagId}">Review Risk Flag</a>
        </div>
      </div>
      <div class="footer">CAS Incubator OS &nbsp;·&nbsp; <a href="${url}" style="color:rgba(255,255,255,0.4);">incubator.nexhunt.xyz</a></div>
    </div>
  </div>
</body>
</html>`;
}

export function renderRiskAlertText(data: RiskAlertEmailData): string {
  const url = data.platformUrl ?? "https://incubator.nexhunt.xyz";
  return `RISK FLAG ALERT — CAS Incubator OS

Student: ${data.studentName}
Flag Type: ${data.flagType.replace(/_/g, " ")}
Severity: ${data.severity.toUpperCase()}
Raised By: ${data.raisedBy}

Description:
${data.description}

Review this flag: ${url}/admin/risks/${data.flagId}

CAS Incubator OS
`;
}
