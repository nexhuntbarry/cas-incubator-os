export interface UserInviteEmailData {
  email: string;
  role: string;
  displayName?: string;
  signInUrl: string;
}

function formatRole(role: string): string {
  const map: Record<string, string> = {
    super_admin: "Super Admin",
    teacher: "Teacher",
    mentor: "Mentor",
    student: "Student",
    parent: "Parent",
  };
  return map[role] ?? role;
}

export function renderUserInviteHtml(data: UserInviteEmailData): string {
  const { email, role, displayName, signInUrl } = data;
  const greeting = displayName ? `Hi ${displayName.split(" ")[0]},` : "Hi there,";
  const formattedRole = formatRole(role);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to CAS Incubator OS</title>
  <style>
    body { margin: 0; padding: 0; background: #0A0F1E; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #E2E8F0; }
    .container { max-width: 600px; margin: 0 auto; background: #0D1326; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0057FF 0%, #00C9B1 100%); padding: 40px; text-align: center; }
    .logo { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .tagline { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 6px; }
    .body { padding: 40px; }
    .greeting { font-size: 20px; font-weight: 700; color: #E2E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #CBD5E0; margin-bottom: 16px; }
    .role-badge { display: inline-block; background: rgba(0,87,255,0.15); color: #4D9EFF; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(0,87,255,0.3); margin: 4px 0 20px; }
    .cta { margin: 32px 0 0; text-align: center; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #0057FF 0%, #00C9B1 100%); color: #fff; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 10px; text-decoration: none; }
    .note { font-size: 13px; color: rgba(255,255,255,0.35); margin-top: 24px; line-height: 1.6; }
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
        <p class="greeting">${greeting}</p>
        <p class="text">
          You've been invited to join <strong>CAS Incubator OS</strong> — an AI-powered project-based learning platform for the next generation of builders and changemakers.
        </p>
        <p class="text">Your account has been set up with the role:</p>
        <div><span class="role-badge">${formattedRole}</span></div>
        <p class="text">
          Click below to sign in and get started. Use <strong>${email}</strong> to sign in — your account is ready and waiting.
        </p>
        <div class="cta">
          <a href="${signInUrl}">Sign in to CAS Incubator OS</a>
        </div>
        <p class="note">
          If you weren't expecting this invitation, you can safely ignore this email.<br/>
          This link takes you to the sign-in page — sign in with your Google account or create a password.
        </p>
      </div>
      <div class="footer">
        <p>
          Invited to <a href="https://incubator.nexhunt.xyz">incubator.nexhunt.xyz</a>
        </p>
        <p style="margin-top:8px;">© ${new Date().getFullYear()} CAS Incubator OS. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function renderUserInviteText(data: UserInviteEmailData): string {
  const { email, role, displayName, signInUrl } = data;
  const greeting = displayName ? `Hi ${displayName.split(" ")[0]},` : "Hi there,";
  const formattedRole = formatRole(role);

  return `${greeting}

You've been invited to join CAS Incubator OS — an AI-powered project-based learning platform.

Your role: ${formattedRole}

Sign in using ${email}:
${signInUrl}

If you weren't expecting this invitation, you can safely ignore this email.

---
© ${new Date().getFullYear()} CAS Incubator OS · incubator.nexhunt.xyz
`;
}
