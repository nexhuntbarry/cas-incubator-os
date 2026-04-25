import { NextResponse } from "next/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { isValidRole } from "@/lib/clerk-helpers";
import { sendGenericEmail } from "@/lib/email/send";
import {
  renderUserInviteHtml,
  renderUserInviteText,
} from "@/lib/email/templates/user-invite";

export async function POST(req: Request) {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { email, role, displayName } = body as {
    email?: string;
    role?: string;
    displayName?: string;
  };

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (!isValidRole(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Check if user already exists in users table
  const { data: existing } = await supabase
    .from("users")
    .select("id, role, account_status")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    // User row already exists — just update role
    const { error: updateError } = await supabase
      .from("users")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      userId: existing.id,
      alreadyExists: true,
      emailSent: false,
    });
  }

  // Create pending user row
  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({
      email,
      role,
      display_name: displayName ?? email.split("@")[0],
      account_status: "pending",
      metadata: { invited: true, invited_at: new Date().toISOString() },
    })
    .select("id")
    .single();

  if (insertError || !newUser) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create user" },
      { status: 500 }
    );
  }

  // Send invite email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://incubator.nexhunt.xyz";
  const signInUrl = `${appUrl}/sign-in?email=${encodeURIComponent(email)}`;

  const emailResult = await sendGenericEmail({
    to: email,
    subject: "You've been invited to CAS Incubator OS — Sign in to get started",
    html: renderUserInviteHtml({ email, role, displayName, signInUrl }),
    text: renderUserInviteText({ email, role, displayName, signInUrl }),
  });

  return NextResponse.json({
    ok: true,
    userId: newUser.id,
    alreadyExists: false,
    emailSent: emailResult.success,
  });
}
