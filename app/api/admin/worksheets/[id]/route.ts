import { NextResponse } from "next/server";
import { getLocale } from "next-intl/server";
import { requireAnyRole } from "@/lib/rbac";
import { getServiceClient } from "@/lib/supabase";
import { localizedField, localizedArrayByKey } from "@/lib/i18n-content";
import { isLocale, defaultLocale } from "@/i18n/config";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAnyRole(["super_admin", "teacher"]);
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("worksheet_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ?raw=1 returns the base columns untouched (used by admin edit form).
  // Default response is localized for the active NEXT_LOCALE so display pages
  // (student worksheet, teacher/admin previews) get the right language.
  const url = new URL(req.url);
  if (url.searchParams.get("raw") === "1") {
    return NextResponse.json(data);
  }

  const localeStr = await getLocale();
  const locale = isLocale(localeStr) ? localeStr : defaultLocale;

  type FieldRow = { key: string } & Record<string, unknown>;
  const baseFields = (Array.isArray(data.fields_schema) ? data.fields_schema : []) as FieldRow[];
  const overrideFields = (data.i18n?.[locale]?.fields_schema ?? null) as FieldRow[] | null;

  const localized = {
    ...data,
    title: localizedField(data, "title", locale) ?? data.title,
    description: localizedField(data, "description", locale) ?? data.description,
    instructions: localizedField(data, "instructions", locale) ?? data.instructions,
    fields_schema: localizedArrayByKey(baseFields, overrideFields, "key"),
  };

  return NextResponse.json(localized);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAnyRole(["super_admin", "teacher"]);
  if (result instanceof NextResponse) return result;

  const { id } = await params;
  const body = await req.json();

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("worksheet_templates")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
