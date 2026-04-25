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
import {
  renderWelcomeHtml,
  renderWelcomeText,
  type WelcomeEmailData,
} from "./templates/welcome";
import {
  renderWorksheetAssignedHtml,
  renderWorksheetAssignedText,
  type WorksheetAssignedEmailData,
} from "./templates/worksheet-assigned";
import {
  renderWorksheetReminderHtml,
  renderWorksheetReminderText,
  type WorksheetReminderEmailData,
} from "./templates/worksheet-reminder";

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

export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<SendResult> {
  if (isDev) {
    console.log("[email:dev] sendWelcomeEmail →", to, data.displayName);
    return { success: true, id: "dev-mock" };
  }

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: "Welcome to CAS Incubator OS",
      html: renderWelcomeHtml(data),
      text: renderWelcomeText(data),
    });

    if (result.error) {
      console.error("[email] sendWelcomeEmail error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[email] sendWelcomeEmail exception:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendWorksheetAssigned(
  to: string,
  data: WorksheetAssignedEmailData
): Promise<SendResult> {
  if (isDev) {
    console.log("[email:dev] sendWorksheetAssigned →", to, data.worksheetTitle);
    return { success: true, id: "dev-mock" };
  }

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `New worksheet assigned: ${data.worksheetTitle} — Due ${data.dueDate}`,
      html: renderWorksheetAssignedHtml(data),
      text: renderWorksheetAssignedText(data),
    });

    if (result.error) {
      console.error("[email] sendWorksheetAssigned error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[email] sendWorksheetAssigned exception:", err);
    return { success: false, error: String(err) };
  }
}

export async function sendWorksheetReminder(
  to: string,
  data: WorksheetReminderEmailData
): Promise<SendResult> {
  if (isDev) {
    console.log("[email:dev] sendWorksheetReminder →", to, data.worksheetTitle, data.dueIn);
    return { success: true, id: "dev-mock" };
  }

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: `Reminder: ${data.worksheetTitle} due in ${data.dueIn}`,
      html: renderWorksheetReminderHtml(data),
      text: renderWorksheetReminderText(data),
    });

    if (result.error) {
      console.error("[email] sendWorksheetReminder error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[email] sendWorksheetReminder exception:", err);
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
