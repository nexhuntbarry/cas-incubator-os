import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserButton } from "@clerk/nextjs";
import LessonViewer from "@/components/curriculum/LessonViewer";
import Link from "next/link";
import { BookOpen } from "lucide-react";

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
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8 no-print">
        <div className="flex items-center gap-4">
          <Logo size={28} />
          <Link
            href="/student/resources"
            className="text-xs text-soft-gray/50 hover:text-soft-gray flex items-center gap-1 transition-colors"
          >
            <BookOpen size={12} />
            Resources
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <LessonViewer asset={asset} allLessons={lessons} baseHref="/student/resources" />
      </main>
    </div>
  );
}
