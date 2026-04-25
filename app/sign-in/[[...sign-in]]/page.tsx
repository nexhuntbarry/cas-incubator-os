import { redirect } from "next/navigation";

// Permanent fix: redirect to Clerk's hosted Account Portal.
// Embedded <SignIn /> does not mount when a Clerk dev instance (pk_test_*)
// is served from a production custom domain — the __clerk_db_jwt handshake
// cookie cannot be set on arbitrary hosts. The hosted portal lives on
// Clerk's own domain and works regardless of dev/prod instance.
const PORTAL_BASE = "https://uncommon-griffon-50.accounts.dev";
const APP_ORIGIN = "https://incubator.nexhunt.xyz";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.redirect_url ?? `${APP_ORIGIN}/`;
  redirect(`${PORTAL_BASE}/sign-in?redirect_url=${encodeURIComponent(returnTo)}`);
}
