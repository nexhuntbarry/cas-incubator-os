import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import LessonViewer from "@/components/curriculum/LessonViewer";
import Shell from "@/components/student/Shell";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentLessonPage({ params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const supabase = getServiceClient();

  const [{ data: asset }, { data: allAssets }] = await Promise.all([
    supabase
      .from("curriculum_assets")
      .select("id, title, asset_type, url, lesson_number, content_md")
      .eq("id", id)
      .contains("visibility_scope", ["student"])
      .single(),
    supabase
      .from("curriculum_assets")
      .select("id, title, lesson_number")
      .contains("visibility_scope", ["student"])
      .not("lesson_number", "is", null)
      .order("lesson_number", { ascending: true }),
  ]);

  if (!asset) notFound();

  const lessons = (allAssets ?? []).filter(
    (a): a is { id: string; lesson_number: number; title: string } =>
      a.lesson_number !== null
  );

  return (
    <Shell title={asset.title} introKey="student.resourceDetail">
      <div className="max-w-6xl">
        <LessonViewer asset={asset} allLessons={lessons} baseHref="/student/resources" />
      </div>
    </Shell>
  );
}
