export interface WelcomeEmailData {
  displayName: string;
  email: string;
  platformUrl?: string;
}

export function renderWelcomeHtml(data: WelcomeEmailData): string {
  const url = data.platformUrl ?? "https://incubator.nexhunt.xyz";
  const firstName = data.displayName.split(" ")[0] ?? data.displayName;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to CAS Incubator OS</title>
  <style>
    body { margin: 0; padding: 0; background: #0A0F1E; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #E2E8F0; }
    .container { max-width: 600px; margin: 0 auto; background: #0D1326; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0057FF 0%, #00C9B1 100%); padding: 40px; text-align: center; }
    .logo { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .tagline { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 6px; }
    .body { padding: 40px; }
    .greeting { font-size: 20px; font-weight: 700; color: #E2E8F0; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.7; color: #CBD5E0; margin-bottom: 16px; }
    .steps { background: rgba(255,255,255,0.04); border-radius: 12px; padding: 24px; margin: 24px 0; }
    .step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .step:last-child { margin-bottom: 0; }
    .step-num { background: rgba(0,87,255,0.2); color: #4D9EFF; font-size: 12px; font-weight: 700; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; line-height: 24px; text-align: center; }
    .step-text { font-size: 14px; color: #CBD5E0; line-height: 1.5; }
    .step-title { font-weight: 600; color: #E2E8F0; }
    .cta { margin: 32px 0 0; text-align: center; }
    .cta a { display: inline-block; background: linear-gradient(135deg, #0057FF 0%, #00C9B1 100%); color: #fff; font-size: 15px; font-weight: 700; padding: 14px 36px; border-radius: 10px; text-decoration: none; }
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
        <p class="greeting">Welcome, ${firstName}! 🎉</p>
        <p class="text">
          You're now part of CAS Incubator OS — an AI-powered project-based learning platform
          built for the next generation of builders and changemakers.
        </p>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text">
              <div class="step-title">Complete your profile</div>
              Sign in and fill out your intake form to get matched with the right cohort and mentor.
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text">
              <div class="step-title">Start your project journey</div>
              Work through the CAS Method stages — from idea discovery all the way to showcase.
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text">
              <div class="step-title">Get AI-powered support</div>
              Use AI worksheet feedback, risk detection, and project coaching built right into the platform.
            </div>
          </div>
        </div>
        <p class="text">
          Need help? Visit the Resources section inside the platform or reply to this email.
        </p>
        <div class="cta">
          <a href="${url}">Go to CAS Incubator OS</a>
        </div>
      </div>
      <div class="footer">
        <p>
          You received this because you created an account at
          <a href="${url}">incubator.nexhunt.xyz</a>.
        </p>
        <p style="margin-top:8px;">© ${new Date().getFullYear()} CAS Incubator OS. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function renderWelcomeText(data: WelcomeEmailData): string {
  const url = data.platformUrl ?? "https://incubator.nexhunt.xyz";
  const firstName = data.displayName.split(" ")[0] ?? data.displayName;

  return `Welcome to CAS Incubator OS, ${firstName}!

Build Ideas. Shape Projects. Launch Impact.

You're now part of CAS Incubator OS — an AI-powered project-based learning platform built for the next generation of builders.

GETTING STARTED:

1. Complete your profile
   Sign in and fill out your intake form to get matched with the right cohort and mentor.

2. Start your project journey
   Work through the CAS Method stages from idea discovery to showcase.

3. Get AI-powered support
   Worksheet feedback, risk detection, and project coaching are built right into the platform.

Visit the platform: ${url}

Need help? Reply to this email or check the Resources section inside the platform.

---
© ${new Date().getFullYear()} CAS Incubator OS · incubator.nexhunt.xyz
`;
}
