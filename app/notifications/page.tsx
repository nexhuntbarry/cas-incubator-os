import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase";
import NotificationsClient from "@/components/shared/NotificationsClient";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const supabase = getServiceClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-deep-navy text-soft-gray">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Bell size={22} className="text-electric-blue" />
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
        <NotificationsClient initialNotifications={notifications ?? []} />
      </div>
    </div>
  );
}
