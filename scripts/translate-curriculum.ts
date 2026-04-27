/**
 * Bilingual content populator for CAS Incubator OS.
 *
 * Reads each translatable row from Supabase and writes a Traditional-Chinese
 * (`zh`) translation into the `i18n` JSONB column added by migration 0015.
 *
 * Run with:
 *   ANTHROPIC_API_KEY=... \
 *   SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/translate-curriculum.ts [table?] [--limit N] [--dry] [--force]
 *
 * Tables:
 *   curriculum_assets · worksheet_templates · rubric_templates ·
 *   checkpoint_templates · method_stage_definitions
 *
 * Skips rows where i18n.zh already exists unless --force is passed.
 *
 * Uses the Anthropic Messages API directly via fetch (no extra deps beyond
 * @supabase/supabase-js, which is already in package.json).
 */
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required");
if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const args = process.argv.slice(2);
const TABLE_FILTER = args.find((a) => !a.startsWith("--"));
const LIMIT = (() => {
  const idx = args.indexOf("--limit");
  if (idx === -1) return undefined;
  return Number(args[idx + 1]);
})();
const DRY_RUN = args.includes("--dry");
const FORCE = args.includes("--force");

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

const MODEL = "claude-sonnet-4-5";

interface TableSpec {
  name: string;
  fields: string[];
  jsonFields?: { name: string; itemKey?: string; itemFields: string[] }[];
  jsonObjects?: { name: string; fields: string[] }[];
}

const SPECS: Record<string, TableSpec> = {
  curriculum_assets: {
    name: "curriculum_assets",
    fields: ["title", "description", "content_md"],
    jsonObjects: [{ name: "metadata", fields: ["activities", "objectives", "summary"] }],
  },
  worksheet_templates: {
    name: "worksheet_templates",
    fields: ["title", "description"],
    jsonFields: [
      {
        name: "fields_schema",
        itemKey: "key",
        itemFields: ["label", "helpText", "placeholder", "options"],
      },
    ],
  },
  rubric_templates: {
    name: "rubric_templates",
    fields: ["name", "guidance_notes"],
    jsonFields: [
      { name: "criteria", itemKey: "key", itemFields: ["label", "levels"] },
    ],
  },
  checkpoint_templates: {
    name: "checkpoint_templates",
    fields: ["checkpoint_name", "description"],
    jsonFields: [
      { name: "requirements", itemFields: ["title", "description", "label"] },
    ],
  },
  method_stage_definitions: {
    name: "method_stage_definitions",
    fields: ["name", "description"],
  },
};

interface AnthropicMessageResp {
  content: Array<{ type: string; text?: string }>;
}

async function callAnthropic(payload: unknown): Promise<unknown> {
  const sys = `You are a professional translator from English to Traditional Chinese (zh-TW)
for an educational platform that runs an entrepreneurship/incubator program for high-school students.

Translate ONLY the string values in the provided JSON. Preserve:
- The exact JSON shape and all keys
- Markdown formatting (headings, lists, links, code fences)
- Worksheet field keys (do not translate "key" values)
- Numeric placeholders, URLs, and code blocks
- HTML / JSX tags
- Names and proper nouns may stay in English when natural

Return ONLY valid JSON. No commentary, no code fences.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      system: sys,
      messages: [
        {
          role: "user",
          content: `Translate the string values to Traditional Chinese:\n\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }
  const data = (await res.json()) as AnthropicMessageResp;
  const text = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse model output:", cleaned.slice(0, 500));
    throw err;
  }
}

function buildPayload(row: Record<string, unknown>, spec: TableSpec): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of spec.fields) {
    if (row[f] != null) out[f] = row[f];
  }
  for (const j of spec.jsonFields ?? []) {
    if (Array.isArray(row[j.name])) {
      out[j.name] = (row[j.name] as Record<string, unknown>[]).map((item) => {
        const sub: Record<string, unknown> = {};
        if (j.itemKey && item[j.itemKey] != null) sub[j.itemKey] = item[j.itemKey];
        for (const f of j.itemFields) {
          if (item[f] != null) sub[f] = item[f];
        }
        return sub;
      });
    }
  }
  for (const j of spec.jsonObjects ?? []) {
    const obj = row[j.name] as Record<string, unknown> | null | undefined;
    if (obj && typeof obj === "object") {
      const sub: Record<string, unknown> = {};
      for (const f of j.fields) {
        if (obj[f] != null) sub[f] = obj[f];
      }
      if (Object.keys(sub).length > 0) out[j.name] = sub;
    }
  }
  return out;
}

async function processTable(specName: string) {
  const spec = SPECS[specName];
  if (!spec) throw new Error(`Unknown table: ${specName}`);

  console.log(`\n=== ${spec.name} ===`);
  let query = sb.from(spec.name).select("*");
  if (LIMIT) query = query.limit(LIMIT);
  const { data, error } = await query;
  if (error) throw error;
  if (!data) return;

  console.log(`fetched ${data.length} rows`);
  let processed = 0;

  for (const row of data) {
    const id = row.id as string;
    const existingI18n = (row.i18n ?? {}) as Record<string, unknown>;
    if (!FORCE && existingI18n.zh) {
      console.log(`  skip ${id} (zh already present)`);
      continue;
    }

    const payload = buildPayload(row, spec);
    if (Object.keys(payload).length === 0) {
      console.log(`  skip ${id} (no translatable content)`);
      continue;
    }

    console.log(`  translate ${id}…`);
    const translated = await callAnthropic(payload);

    const newI18n = { ...existingI18n, zh: translated };
    if (DRY_RUN) {
      console.log("  (dry-run) would write:", JSON.stringify(newI18n).slice(0, 200) + "…");
    } else {
      const { error: upErr } = await sb
        .from(spec.name)
        .update({ i18n: newI18n })
        .eq("id", id);
      if (upErr) throw upErr;
    }
    processed++;
  }

  console.log(`done: ${processed}/${data.length} rows updated`);
}

async function main() {
  const tables = TABLE_FILTER ? [TABLE_FILTER] : Object.keys(SPECS);
  for (const t of tables) {
    await processTable(t);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
