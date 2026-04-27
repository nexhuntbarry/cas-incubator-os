import { redirect, notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { localizedField } from "@/lib/i18n-content";
import { isLocale, defaultLocale } from "@/i18n/config";
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

  const localeStr = await getLocale();
  const locale = isLocale(localeStr) ? localeStr : defaultLocale;

  const supabase = getServiceClient();

  const [{ data: asset }, { data: allAssets }] = await Promise.all([
    supabase
      .from("curriculum_assets")
      .select("id, title, asset_type, url, lesson_number, content_md, i18n")
      .eq("id", id)
      .single(),
    supabase
      .from("curriculum_assets")
      .select("id, title, lesson_number, i18n")
      .not("lesson_number", "is", null)
      .order("lesson_number", { ascending: true }),
  ]);

  if (!asset) notFound();

  const localizedAsset = {
    id: asset.id,
    asset_type: asset.asset_type,
    url: asset.url,
    lesson_number: asset.lesson_number,
    title: (localizedField(asset, "title", locale) ?? asset.title) as string,
    content_md: (localizedField(asset, "content_md", locale) ?? asset.content_md) as string | null,
  };

  type AllAssetRow = { id: string; lesson_number: number | null; title: string; i18n: Record<string, { title?: string }> | null };
  const lessons = ((allAssets ?? []) as AllAssetRow[])
    .filter((a): a is AllAssetRow & { lesson_number: number } => a.lesson_number !== null)
    .map((a) => ({
      id: a.id,
      lesson_number: a.lesson_number,
      title: (localizedField(a, "title", locale) ?? a.title) as string,
    }));

  return (
    <Shell title={localizedAsset.title} introKey="admin.curriculumLesson">
      <LessonViewer asset={localizedAsset} allLessons={lessons} baseHref="/admin/curriculum" />
    </Shell>
  );
}
