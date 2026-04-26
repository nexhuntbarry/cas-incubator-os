import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Shell from "@/components/admin/Shell";
import LessonViewer from "@/components/curriculum/LessonViewer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminLessonPage({ params }: Props) {
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
      .single(),
    supabase
      .from("curriculum_assets")
      .select("id, title, lesson_number")
      .not("lesson_number", "is", null)
      .order("lesson_number", { ascending: true }),
  ]);

  if (!asset) notFound();

  const lessons = (allAssets ?? []).filter(
    (a): a is { id: string; lesson_number: number; title: string } =>
      a.lesson_number !== null
  );

  return (
    <Shell title={asset.title} introKey="admin.curriculumLesson">
      <LessonViewer asset={asset} allLessons={lessons} baseHref="/admin/curriculum" />
    </Shell>
  );
}
