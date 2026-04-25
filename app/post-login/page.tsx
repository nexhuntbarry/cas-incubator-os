import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const ROLE_DASHBOARD: Record<string, string> = {
  super_admin: "/admin",
  admin: "/admin",
  teacher: "/teacher",
  mentor: "/mentor",
  student: "/student",
  parent: "/parent",
};

// Post-Clerk-auth landing page.
// Sign-in / sign-up pages send users here after the hosted-portal flow,
// so we can resolve their Supabase role and redirect to the right dashboard
// in a single hop. Falls back to landing for unknown / unauth users.
export default async function PostLoginPage() {
  const user = await getCurrentUser();

  // Not authed yet (cookie still propagating?) — bounce to landing rather than loop.
  if (!user) {
    redirect("/");
  }

  const dest = (user.role && ROLE_DASHBOARD[user.role]) ?? "/";
  redirect(dest);
}
