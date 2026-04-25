import { redirect } from "next/navigation";

// Permanent fix: redirect to Clerk's hosted Account Portal.
// See app/sign-in/[[...sign-in]]/page.tsx for the rationale.
const PORTAL_BASE = "https://uncommon-griffon-50.accounts.dev";
const APP_ORIGIN = "https://incubator.nexhunt.xyz";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  // After sign-up, hop through /post-login so the new user lands on the
  // dashboard matching their Supabase role (set by the Clerk webhook).
  const returnTo = params.redirect_url ?? `${APP_ORIGIN}/post-login`;
  redirect(`${PORTAL_BASE}/sign-up?redirect_url=${encodeURIComponent(returnTo)}`);
}
