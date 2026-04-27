import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";

// DELETE /api/admin/users/[id] — super_admin only.
// Hard-deletes the Supabase row and the linked Clerk user so the email is
// fully reusable. Cascading FKs handle any role-specific profile rows.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole("super_admin");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  if (id === auth.userId) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const db = getServiceClient();
  const { data: target } = await db
    .from("users")
    .select("id, role, clerk_user_id, email")
    .eq("id", id)
    .single();
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Sweep role-specific profile tables before the user row goes (FKs may
  // be ON DELETE CASCADE but be explicit so the operation is auditable).
  await db.from("teacher_profiles").delete().eq("user_id", id);
  await db.from("student_profiles").delete().eq("user_id", id);
  await db.from("mentor_profiles").delete().eq("user_id", id);
  await db.from("parent_profiles").delete().eq("user_id", id);

  const { error } = await db.from("users").delete().eq("id", id);
  if (error) {
    console.error("[admin/users DELETE] DB error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }

  // Best-effort: also delete the Clerk user so the email is fully reusable.
  if (target.clerk_user_id) {
    try {
      const cc = await clerkClient();
      await cc.users.deleteUser(target.clerk_user_id);
    } catch (err) {
      console.warn(`[admin/users DELETE] Clerk delete failed for ${target.email}:`, err);
    }
  }

  return NextResponse.json({ ok: true });
}
