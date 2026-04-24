import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { generateWorksheetSummary } from "@/lib/ai/worksheet-summary";

export async function POST(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (result instanceof NextResponse) return result;

  const body = await req.json();
  const { submission_id } = body;

  if (!submission_id) {
    return NextResponse.json({ error: "submission_id required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Fetch submission + template
  const { data: submission, error: subErr } = await supabase
    .from("worksheet_submissions")
    .select("id, answers, version_number, ai_summary_json, template_id")
    .eq("id", submission_id)
    .single();

  if (subErr || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  // Return cached summary if it exists
  if (submission.ai_summary_json) {
    return NextResponse.json({ summary: submission.ai_summary_json, cached: true });
  }

  const { data: template, error: tmplErr } = await supabase
    .from("worksheet_templates")
    .select("title, fields_schema")
    .eq("id", submission.template_id)
    .single();

  if (tmplErr || !template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const fields = Array.isArray(template.fields_schema) ? template.fields_schema : [];
  const summary = await generateWorksheetSummary(
    template.title,
    fields as Array<{ label: string; key: string; type: string }>,
    (submission.answers as Record<string, unknown>) ?? {}
  );

  // Cache in DB (best-effort, don't fail if it errors)
  await supabase
    .from("worksheet_submissions")
    .update({ ai_summary_json: summary })
    .eq("id", submission_id);

  return NextResponse.json({ summary, cached: false });
}
