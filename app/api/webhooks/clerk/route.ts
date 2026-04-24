import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email/send";

const SUPER_ADMIN_EMAILS = new Set([
  "barry.py.chuang01@gmail.com",
  "nexhunt.barry@gmail.com",
  "happymaryann.barry@gmail.com",
]);

interface ClerkEmailAddress {
  email_address: string;
  id: string;
}

interface ClerkUserPayload {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  public_metadata: Record<string, unknown>;
}

interface WebhookEvent {
  type: string;
  data: ClerkUserPayload;
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();

  const wh = new Webhook(secret);
  let event: WebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "user.created" && event.type !== "user.updated") {
    return NextResponse.json({ received: true });
  }

  const userData = event.data;
  const primaryEmail = userData.email_addresses.find(
    (e) => e.id === userData.primary_email_address_id
  );
  const email = primaryEmail?.email_address ?? userData.email_addresses[0]?.email_address ?? "";
  const displayName = [userData.first_name, userData.last_name]
    .filter(Boolean)
    .join(" ") || email.split("@")[0];

  const role = SUPER_ADMIN_EMAILS.has(email) ? "super_admin" : null;

  const supabase = getServiceClient();

  if (event.type === "user.created") {
    // Handle pre-created user rows (admin may have created the email before signup).
    // Prefer UPDATE by email when row exists → preserve role/status set by admin.
    const { data: existing } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      const updateData: Record<string, unknown> = {
        clerk_user_id: userData.id,
        display_name: displayName,
        avatar_url: userData.image_url,
        updated_at: new Date().toISOString(),
      };
      // Super-admin whitelist always takes precedence even over prior role
      if (role === "super_admin") {
        updateData.role = role;
      }
      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", existing.id);

      if (error) {
        console.error("[clerk-webhook] link existing user error:", error);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }
    } else {
      const insertData: Record<string, unknown> = {
        clerk_user_id: userData.id,
        email,
        display_name: displayName,
        avatar_url: userData.image_url,
      };
      if (role) {
        insertData.role = role;
      }

      const { error } = await supabase.from("users").insert(insertData);

      if (error) {
        console.error("[clerk-webhook] insert error:", error);
        return NextResponse.json({ error: "DB error" }, { status: 500 });
      }

      if (email) {
        sendWelcomeEmail(email, { displayName, email }).catch((err) => {
          console.error("[clerk-webhook] welcome email failed:", err);
        });
      }
    }
  } else {
    // user.updated — sync mutable fields
    const { error } = await supabase
      .from("users")
      .update({
        email,
        display_name: displayName,
        avatar_url: userData.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_user_id", userData.id);

    if (error) {
      console.error("[clerk-webhook] update error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
