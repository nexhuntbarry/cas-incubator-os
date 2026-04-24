import { getResend, FROM_ADDRESS } from "./resend";
import {
  renderParentUpdateHtml,
  renderParentUpdateText,
  type ParentUpdateEmailData,
} from "./templates/parent-update";
import {
  renderRiskAlertHtml,
  renderRiskAlertText,
  type RiskAlertEmailData,
} from "./templates/risk-alert";

const isDev = process.env.NODE_ENV !== "production";

export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendParentUpdate(
  to: string,
  data: ParentUpdateEmailData
): Promise<SendResult> {
  if (isDev) {
    console.log("[email:dev] sendParentUpdate →", to, data.subject);
    return { success: true, id: "dev-mock" };
  }

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: data.subject,
      html: renderParentUpdateHtml(data),
      text: renderParentUpdateText(data),
    });

    if (result.error) {
      console.error("[email] sendParentUpdate error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[email] sendParentUpdate exception:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendRiskAlert(
  to: string,
  data: RiskAlertEmailData
): Promise<SendResult> {
  if (isDev) {
    console.log("[email:dev] sendRiskAlert →", to, data.flagType, data.severity);
    return { success: true, id: "dev-mock" };
  }

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `[Risk Alert] ${data.severity.toUpperCase()} — ${data.studentName}: ${data.flagType.replace(/_/g, " ")}`,
      html: renderRiskAlertHtml(data),
      text: renderRiskAlertText(data),
    });

    if (result.error) {
      console.error("[email] sendRiskAlert error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[email] sendRiskAlert exception:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendGenericEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  if (isDev) {
    console.log("[email:dev] sendGenericEmail →", opts.to, opts.subject);
    return { success: true, id: "dev-mock" };
  }

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[email] sendGenericEmail exception:", err);
    return { success: false, error: String(err) };
  }
}
