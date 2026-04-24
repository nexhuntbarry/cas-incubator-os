import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { generateWorksheetFeedback } from "@/lib/ai/worksheet-feedback";

export async function POST(req: Request) {
  const result = await requireAnyRole(["super_admin", "teacher", "mentor"]);
  if (result instanceof NextResponse) return result;

  const body = await req.json();
  const { submission_id } = body;

  if (!submission_id) {
    return NextResponse.json({ error: "submission_id required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: submission, error: subErr } = await supabase
    .from("worksheet_submissions")
    .select("id, answers, template_id, project_id")
    .eq("id", submission_id)
    .single();

  if (subErr || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const { data: template, error: tmplErr } = await supabase
    .from("worksheet_templates")
    .select("title, fields_schema")
    .eq("id", submission.template_id)
    .single();

  if (tmplErr || !template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  let projectSummary: string | undefined;
  if (submission.project_id) {
    const { data: project } = await supabase
      .from("projects")
      .select("title, tagline, description")
      .eq("id", submission.project_id)
      .single();
    if (project) {
      projectSummary = [project.title, project.tagline, project.description]
        .filter(Boolean)
        .join(" — ");
    }
  }

  const fields = Array.isArray(template.fields_schema) ? template.fields_schema : [];

  const feedback = await generateWorksheetFeedback({
    worksheetTitle: template.title,
    fieldsSchema: fields as Array<{ label: string; key: string }>,
    submissionData: (submission.answers as Record<string, unknown>) ?? {},
    projectSummary,
  });

  return NextResponse.json({ feedback });
}
