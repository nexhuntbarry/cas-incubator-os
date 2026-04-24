import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/notifications/notify";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const count = await getUnreadCount(user.userId);
  return NextResponse.json({ count });
}
