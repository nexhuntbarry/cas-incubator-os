import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/teacher/Shell";
import LessonViewer from "@/components/curriculum/LessonViewer";
import LessonWorksheetPanel from "@/components/assignments/LessonWorksheetPanel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeacherLessonPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "super_admin")) {
    redirect("/");
  }

  const supabase = getServiceClient();

  const [{ data: asset }, { data: allAssets }] = await Promise.all([
    supabase
      .from("curriculum_assets")
      .select("id, title, asset_type, url, lesson_number, content_md")
      .eq("id", id)
      .contains("visibility_scope", ["teacher"])
      .single(),
    supabase
      .from("curriculum_assets")
      .select("id, title, lesson_number")
      .contains("visibility_scope", ["teacher"])
      .not("lesson_number", "is", null)
      .order("lesson_number", { ascending: true }),
  ]);

  if (!asset) notFound();

  const lessons = (allAssets ?? []).filter(
    (a): a is { id: string; lesson_number: number; title: string } =>
      a.lesson_number !== null
  );

  // Fetch worksheets linked to this lesson
  const lessonNumber = asset.lesson_number;
  let worksheetTemplates: { id: string; title: string; template_type: string }[] = [];
  let recentByTemplate: Record<string, { id: string; due_date: string; status: string; cohorts: { name: string } | null }[]> = {};

  if (lessonNumber !== null) {
    const { data: templates } = await supabase
      .from("worksheet_templates")
      .select("id, title, template_type")
      .eq("linked_lesson_number", lessonNumber)
      .eq("is_active", true)
      .order("title", { ascending: true });

    worksheetTemplates = templates ?? [];

    if (worksheetTemplates.length > 0) {
      const templateIds = worksheetTemplates.map((t) => t.id);
      const { data: recent } = await supabase
        .from("worksheet_assignments")
        .select("id, template_id, due_date, status, cohorts(name)")
        .in("template_id", templateIds)
        .eq("assigned_by", user.userId)
        .order("created_at", { ascending: false })
        .limit(5);

      for (const a of recent ?? []) {
        const tid = a.template_id as string;
        if (!recentByTemplate[tid]) recentByTemplate[tid] = [];
        if (recentByTemplate[tid].length < 5) {
          recentByTemplate[tid].push({
            id: a.id,
            due_date: a.due_date as string,
            status: a.status as string,
            cohorts: (Array.isArray(a.cohorts) ? a.cohorts[0] : a.cohorts) as { name: string } | null,
          });
        }
      }
    }
  }

  return (
    <Shell title={asset.title} introKey="teacher.resourceDetail">
      <div className="flex gap-6 min-h-0">
        {/* Main lesson content */}
        <div className="flex-1 min-w-0">
          <LessonViewer asset={asset} allLessons={lessons} baseHref="/teacher/resources" />
        </div>

        {/* Worksheet side panel */}
        <div className="w-72 flex-shrink-0 hidden lg:block">
          <div className="sticky top-6">
            <LessonWorksheetPanel
              lessonNumber={lessonNumber}
              templates={worksheetTemplates}
              recentByTemplate={recentByTemplate}
            />
          </div>
        </div>
      </div>
    </Shell>
  );
}
