import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["super_admin", "teacher", "mentor"].includes(user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { feedback } = body;

  if (!feedback) return NextResponse.json({ error: "feedback is required" }, { status: 400 });

  const supabase = getServiceClient();

  const { data: record } = await supabase
    .from("showcase_records")
    .select("feedback_received_json")
    .eq("id", id)
    .single();

  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = Array.isArray(record.feedback_received_json)
    ? record.feedback_received_json
    : [];

  const newEntry = {
    reviewer_id: user.userId,
    reviewer_name: user.displayName,
    feedback,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("showcase_records")
    .update({ feedback_received_json: [...existing, newEntry] })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ showcase: data });
}
