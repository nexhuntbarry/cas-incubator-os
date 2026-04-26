import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import ParentUpdateComposer from "@/components/shared/ParentUpdateComposer";
import Logo from "@/components/Logo";
import { UserButton } from "@clerk/nextjs";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageIntro from "@/components/shared/PageIntro";

export default async function MentorComposeUpdatePage({
  params,
}: {
  params: Promise<{ student_id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "mentor" && user.role !== "super_admin") redirect("/");

  const { student_id } = await params;
  const supabase = getServiceClient();

  const { data: student } = await supabase
    .from("users")
    .select("id, display_name, email")
    .eq("id", student_id)
    .single();

  if (!student) redirect("/mentor/parents");

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("grade, school_name")
    .eq("user_id", student_id)
    .maybeSingle();

  const { data: project } = await supabase
    .from("projects")
    .select("id, title, description, current_stage")
    .eq("student_user_id", student_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <PageIntro tKey="mentor.parentsCompose" />
        <h1 className="text-xl font-bold mb-6">
          Compose Update for{" "}
          <span className="text-electric-blue">{student.display_name}</span>
        </h1>
        <ParentUpdateComposer
          studentUserId={student_id}
          studentName={student.display_name}
          gradeLevel={profile?.grade}
          school={profile?.school_name}
          projectTitle={project?.title}
          projectDescription={project?.description}
          currentMethodStage={project?.current_stage}
          teacherName={user.displayName}
          senderRole={user.role ?? "mentor"}
          backHref="/mentor/parents"
        />
      </div>
    </div>
  );
}
