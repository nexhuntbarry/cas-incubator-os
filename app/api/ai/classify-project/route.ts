import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { classifyProject } from "@/lib/ai/classify-project";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { description } = body;

  if (!description || typeof description !== "string") {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  const classification = await classifyProject(description);
  return NextResponse.json(classification);
}
