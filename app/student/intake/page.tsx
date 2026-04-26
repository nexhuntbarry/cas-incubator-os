import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import IntakeForm from "@/components/student/IntakeForm";
import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageIntro from "@/components/shared/PageIntro";

export default async function StudentIntakePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "student") redirect("/");

  const supabase = getServiceClient();

  // If intake already completed, redirect to project
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("intake_completed_at")
    .eq("user_id", user.userId)
    .single();

  if (profile?.intake_completed_at) {
    redirect("/student/project");
  }

  const t = await getTranslations("student.intake");

  const labels = {
    title: t("title"),
    step1: t("step1"),
    step2: t("step2"),
    step3: t("step3"),
    step4: t("step4"),
    step5: t("step5"),
    submit: t("submit"),
    next: t("next"),
    back: t("back"),
    success: t("success"),
    processing: t("processing"),
  };

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-12">
        <PageIntro tKey="student.intake" />
        <h1 className="text-2xl font-bold mb-2">{labels.title}</h1>
        <IntakeForm labels={labels} />
      </main>
    </div>
  );
}
