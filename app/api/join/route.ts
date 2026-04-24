import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { code, role, studentProfile, parentProfile, consentGiven } = body;

  if (!code || !role) {
    return NextResponse.json(
      { error: "code and role are required" },
      { status: 400 }
    );
  }

  if (role !== "student" && role !== "parent") {
    return NextResponse.json(
      { error: "role must be student or parent" },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  // Look up class code
  const { data: classCode, error: codeErr } = await supabase
    .from("class_codes")
    .select("*, cohorts(id, name, max_students)")
    .eq("code", code)
    .single();

  if (codeErr || !classCode) {
    return NextResponse.json({ error: "Class code not found" }, { status: 404 });
  }

  if (!classCode.is_active) {
    return NextResponse.json({ error: "Class code is not active" }, { status: 400 });
  }

  if (
    classCode.expires_at &&
    new Date(classCode.expires_at) < new Date()
  ) {
    return NextResponse.json({ error: "Class code has expired" }, { status: 400 });
  }

  if (
    classCode.max_uses !== null &&
    classCode.use_count >= classCode.max_uses
  ) {
    return NextResponse.json({ error: "Class code is full" }, { status: 400 });
  }

  // Get the Supabase user
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("id, role")
    .eq("clerk_user_id", clerkId)
    .single();

  if (userErr || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.role && user.role !== "student" && user.role !== "parent") {
    return NextResponse.json(
      { error: "User already has an assigned role" },
      { status: 409 }
    );
  }

  const cohortId = classCode.cohort_id;

  // Assign role
  const { error: roleErr } = await supabase
    .from("users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (roleErr) {
    return NextResponse.json({ error: roleErr.message }, { status: 500 });
  }

  if (role === "student") {
    // Create student profile
    const { error: profileErr } = await supabase
      .from("student_profiles")
      .upsert(
        {
          user_id: user.id,
          grade: studentProfile?.grade ?? null,
          school_name: studentProfile?.school ?? null,
          birth_year: studentProfile?.birthYear ?? null,
        },
        { onConflict: "user_id" }
      );

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // Create enrollment record with consent metadata
    const { error: enrollErr } = await supabase
      .from("enrollment_records")
      .upsert(
        {
          cohort_id: cohortId,
          student_user_id: user.id,
          class_code_id: classCode.id,
          status: "active",
          notes: JSON.stringify({
            consent_given: consentGiven ?? false,
            consent_at: consentGiven ? new Date().toISOString() : null,
          }),
        },
        { onConflict: "cohort_id,student_user_id" }
      );

    if (enrollErr) {
      return NextResponse.json({ error: enrollErr.message }, { status: 500 });
    }
  } else {
    // parent — create parent-student link if child clerk_id provided
    if (parentProfile?.childClerkId) {
      const { data: childUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_user_id", parentProfile.childClerkId)
        .single();

      if (childUser) {
        await supabase.from("parent_student_links").upsert(
          {
            parent_user_id: user.id,
            student_user_id: childUser.id,
            consent_given: consentGiven ?? false,
            consent_at: consentGiven ? new Date().toISOString() : null,
          },
          { onConflict: "parent_user_id,student_user_id" }
        );
      }
    }
  }

  // Increment use_count directly
  await supabase
    .from("class_codes")
    .update({ use_count: (classCode.use_count ?? 0) + 1 })
    .eq("id", classCode.id);

  return NextResponse.json({ success: true, cohortId, role });
}
