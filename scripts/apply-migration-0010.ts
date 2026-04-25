/**
 * Apply migration 0010 — curriculum_assets.content_md
 *
 * This script applies the migration using supabase-js service role client.
 * It handles the ALTER TABLE by calling a temporary PG function, then
 * patches each of the 20 lesson rows with their markdown content.
 *
 * Usage:
 *   npx tsx scripts/apply-migration-0010.ts
 *
 * Requires env vars in .env.local (run `vercel env pull .env.local` first).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local manually (avoid dotenv dependency)
const envPath = join(process.cwd(), ".env.local");
try {
  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)="?(.+?)"?$/);
    if (match) process.env[match[1]] = match[2];
  }
} catch {
  // .env.local not found — rely on existing env vars
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Per-lesson markdown content
const LESSONS: { lesson_number: number; title_prefix: string; content: string }[] = [];

// Load all 20 lessons from /tmp/lessons
for (let n = 1; n <= 20; n++) {
  try {
    const content = readFileSync(`/tmp/lessons/lesson-${String(n).padStart(2, "0")}.md`, "utf8");
    LESSONS.push({ lesson_number: n, title_prefix: `Lesson ${n}:`, content });
  } catch {
    console.warn(`Warning: could not read /tmp/lessons/lesson-${String(n).padStart(2, "0")}.md`);
  }
}

async function run() {
  console.log(`Loaded ${LESSONS.length} lesson markdown files.`);

  // Step 1: Check if content_md column already exists by trying a select
  const { error: colCheckError } = await supabase
    .from("curriculum_assets")
    .select("content_md")
    .limit(1);

  if (colCheckError?.message?.includes("does not exist")) {
    console.log("Column content_md does not exist yet.");
    console.log("\n=== ACTION REQUIRED ===");
    console.log("Please run the following SQL in the Supabase Dashboard SQL Editor:");
    console.log("  https://supabase.com/dashboard/project/thksgxfwrfwdtkhyejll/sql/new");
    console.log("\nSQL:");
    console.log("  ALTER TABLE curriculum_assets ADD COLUMN IF NOT EXISTS content_md text;");
    console.log("\nThen re-run this script to populate the content.");
    process.exit(0);
  }

  console.log("Column content_md exists. Proceeding with content updates...\n");

  // Step 2: Fetch all curriculum assets with lesson numbers
  const { data: assets, error: fetchError } = await supabase
    .from("curriculum_assets")
    .select("id, title, lesson_number")
    .not("lesson_number", "is", null)
    .order("lesson_number", { ascending: true });

  if (fetchError) {
    console.error("Error fetching assets:", fetchError.message);
    process.exit(1);
  }

  console.log(`Found ${assets?.length ?? 0} curriculum assets with lesson numbers.`);

  let updated = 0;
  let skipped = 0;

  for (const lesson of LESSONS) {
    // Find the matching asset
    const asset = assets?.find(
      (a) =>
        a.lesson_number === lesson.lesson_number &&
        a.title?.startsWith(lesson.title_prefix)
    );

    if (!asset) {
      console.warn(`  SKIP: No asset found for Lesson ${lesson.lesson_number} (title prefix: "${lesson.title_prefix}")`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("curriculum_assets")
      .update({ content_md: lesson.content })
      .eq("id", asset.id);

    if (updateError) {
      console.error(`  ERROR: Lesson ${lesson.lesson_number} (${asset.id}): ${updateError.message}`);
    } else {
      console.log(`  OK: Lesson ${lesson.lesson_number} — "${asset.title}" (${lesson.content.length} chars)`);
      updated++;
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
