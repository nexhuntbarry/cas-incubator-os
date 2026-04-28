import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Anon client — respects RLS. Use for public reads if needed.
 */
export function getAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Service role client — bypasses RLS.
 * Use ONLY in Server Components, Route Handlers, or Server Actions.
 * Never expose to the browser.
 */
export function getServiceClient() {
  // Defense in depth: throw loudly if a client component ever imports + calls
  // this — surfaces the leak in dev/CI before the service-role JWT ships to
  // the browser bundle.
  if (typeof window !== "undefined") {
    throw new Error(
      "[supabase] getServiceClient() called in the browser. " +
        "Service-role key must never reach client code. " +
        "Use getAnonClient() for client-side reads.",
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Backward-compat aliases
export const createBrowserClient = getAnonClient;
export const createServerClient = getServiceClient;
