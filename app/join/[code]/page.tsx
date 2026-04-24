import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import Logo from "@/components/Logo";
import JoinForm from "./JoinForm";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function JoinCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { userId: clerkId } = await auth();
  const t = await getTranslations("join");

  // Validate code exists
  const supabase = getServiceClient();
  const { data: classCode } = await supabase
    .from("class_codes")
    .select("code, is_active, expires_at, max_uses, use_count, cohorts(name)")
    .eq("code", code)
    .single();

  if (!classCode) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-deep-navy">
        <Logo size={48} className="mb-6" />
        <p className="text-status-error font-semibold">{t("codeNotFound")}</p>
        <Link href="/" className="mt-4 text-electric-blue text-sm hover:underline">
          {t("goHome")}
        </Link>
      </main>
    );
  }

  if (!classCode.is_active) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-deep-navy">
        <Logo size={48} className="mb-6" />
        <p className="text-status-warning font-semibold">{t("codePaused")}</p>
      </main>
    );
  }

  if (classCode.expires_at && new Date(classCode.expires_at) < new Date()) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-deep-navy">
        <Logo size={48} className="mb-6" />
        <p className="text-status-warning font-semibold">{t("codeExpired")}</p>
      </main>
    );
  }

  // Not signed in
  if (!clerkId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-deep-navy">
        <Logo size={56} className="mb-6" />
        <h1 className="text-xl font-bold text-soft-gray mb-2">{t("title")}</h1>
        <p className="text-soft-gray/60 text-sm mb-2 text-center max-w-sm">
          {t("unauthMessage", { code })}
        </p>
        <p className="text-electric-blue font-mono text-lg font-bold mb-6">{code}</p>
        <Link
          href={`/sign-in?redirect_url=/join/${code}`}
          className="px-6 py-3 rounded-xl bg-electric-blue text-white font-semibold text-sm hover:bg-electric-blue/90 transition-colors"
        >
          {t("signInToJoin")}
        </Link>
      </main>
    );
  }

  // Signed in — check existing role
  const user = await getCurrentUser();

  if (user?.role && user.role !== "student" && user.role !== "parent") {
    // Already has non-joinable role, redirect to their dashboard
    redirect(`/${user.role.replace("_", "-")}`);
  }

  const cohortsRaw = classCode.cohorts;
  const cohortName =
    cohortsRaw && !Array.isArray(cohortsRaw)
      ? (cohortsRaw as { name: string }).name
      : Array.isArray(cohortsRaw) && cohortsRaw.length > 0
        ? (cohortsRaw[0] as { name: string }).name
        : "";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-deep-navy">
      <Logo size={56} className="mb-6" />
      <h1 className="text-2xl font-bold text-soft-gray mb-1">{t("title")}</h1>
      <p className="text-soft-gray/50 text-sm mb-1">
        {t("joiningCohort")}: <span className="text-vivid-teal font-medium">{cohortName}</span>
      </p>
      <p className="text-electric-blue font-mono font-bold mb-8">{code}</p>
      <JoinForm code={code} />
    </main>
  );
}
