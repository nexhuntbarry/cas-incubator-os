import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Use Resend's free verified domain until incubator.nexhunt.xyz DNS (SPF/DKIM) is verified.
// To use custom domain: verify in Resend dashboard then set RESEND_FROM env var.
export const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "CAS Incubator OS <onboarding@resend.dev>";
