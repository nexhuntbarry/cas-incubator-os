import { getServiceClient } from "./supabase";

// Base32 alphabet — no ambiguous chars (0, 1, O, I, L, U)
const BASE32_CHARS = "ABCDEFGHJKMNPQRSTVWXYZ2345678";

function randomSegment(len: number): string {
  let result = "";
  for (let i = 0; i < len; i++) {
    result += BASE32_CHARS[Math.floor(Math.random() * BASE32_CHARS.length)];
  }
  return result;
}

function generateCode(): string {
  return `CAS-INC-${randomSegment(4)}-${randomSegment(4)}`;
}

/**
 * Generates a unique class code with up to 5 collision retries.
 */
export async function createClassCode(opts: {
  cohortId: string;
  expiresAt?: string | null;
  maxUses?: number | null;
  createdBy?: string | null;
}): Promise<string> {
  const supabase = getServiceClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { error } = await supabase.from("class_codes").insert({
      cohort_id: opts.cohortId,
      code,
      expires_at: opts.expiresAt ?? null,
      max_uses: opts.maxUses ?? null,
      created_by: opts.createdBy ?? null,
      is_active: true,
      use_count: 0,
    });

    if (!error) return code;

    // Unique violation — retry
    if (error.code === "23505") continue;
    throw new Error(`class_codes insert failed: ${error.message}`);
  }

  throw new Error("Failed to generate unique class code after 5 attempts");
}
