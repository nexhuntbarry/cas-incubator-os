/**
 * generate-worksheet-schemas.ts
 *
 * Extracts text from curriculum-part1-worksheets-v2.docx,
 * uses Claude to parse into per-worksheet JSON form schemas,
 * then writes supabase/migrations/0012_worksheet_schemas.sql
 *
 * Usage:
 *   npx tsx scripts/generate-worksheet-schemas.ts
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Load .env.local
const envPath = join(process.cwd(), ".env.local");
try {
  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)="?(.+?)"?$/);
    if (match) process.env[match[1]] = match[2];
  }
} catch {
  // rely on existing env
}

// ─── Extract docx text via Python (writes helper to /tmp to avoid quoting issues) ─
function extractDocxText(docxPath: string): string {
  const helperPath = "/tmp/_docx_extract.py";
  const script = [
    "import zipfile, xml.etree.ElementTree as ET, sys",
    "def docx_text(path):",
    "    ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'",
    "    with zipfile.ZipFile(path) as z:",
    "        xml = z.read('word/document.xml')",
    "    root = ET.fromstring(xml)",
    "    paras = []",
    "    for p in root.iter(ns+'p'):",
    "        t = ''.join(n.text or '' for n in p.iter(ns+'t'))",
    "        paras.append(t)",
    "    return '\\n'.join(paras)",
    "print(docx_text(sys.argv[1]))",
  ].join("\n");
  writeFileSync(helperPath, script, "utf8");
  return execSync(`python3 "${helperPath}" "${docxPath}"`, {
    maxBuffer: 10 * 1024 * 1024,
  }).toString("utf8");
}

// ─── Zod schema for a single worksheet ────────────────────────────────────────
const FieldSchema = z.object({
  key: z.string().describe("snake_case identifier"),
  label: z.string().describe("Student-facing question label"),
  type: z.enum([
    "text",
    "textarea",
    "number",
    "select",
    "multi_select",
    "radio",
    "date",
    "url",
  ]),
  helpText: z.string().optional().describe("Optional hint shown below the label"),
  required: z.boolean(),
  options: z
    .array(z.string())
    .optional()
    .describe("For select/multi_select/radio only"),
});

const WorksheetSchema = z.object({
  title: z
    .string()
    .describe(
      "Title matching DB — e.g. 'Worksheet 1: Personal Interests and Goals Reflection'"
    ),
  instructions: z.string().describe("Intro instructions paragraph(s)"),
  fields: z
    .array(FieldSchema)
    .describe("All student-facing prompts as form fields"),
});

const ResponseSchema = z.object({
  worksheets: z.array(WorksheetSchema),
});

// ─── Escape SQL dollar-quote content ──────────────────────────────────────────
function escapeDollarQuote(tag: string, content: string): string {
  // If the content contains the tag, we can't use it — but tags are unique so this is safe
  return `${tag}${content}${tag}`;
}

// ─── Build SQL UPDATE for one worksheet ───────────────────────────────────────
function buildUpdate(
  worksheet: z.infer<typeof WorksheetSchema>,
  idx: number
): string {
  const n = idx + 1;
  const instrTag = `$ws_${n}_inst$`;
  const schemaTag = `$ws_${n}_schema$`;

  const schemaJson = JSON.stringify(worksheet.fields, null, 2);

  return `-- Worksheet ${n}: ${worksheet.title}
UPDATE worksheet_templates
SET instructions = ${escapeDollarQuote(instrTag, worksheet.instructions)},
    fields_schema = ${escapeDollarQuote(schemaTag, schemaJson)}::jsonb,
    updated_at = now()
WHERE title LIKE 'Worksheet ${n}:%' OR title LIKE 'Worksheet ${n} –%' OR title LIKE 'Worksheet ${n} -%';
`;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const docxPath = join(
    process.cwd(),
    "../cas-incubator-os-assets/curriculum-part1-worksheets-v2.docx"
  );
  console.log("Extracting docx text…");
  const rawText = extractDocxText(docxPath);
  console.log(`Extracted ${rawText.length} chars from docx.`);

  // Split at worksheet boundaries to create smaller chunks for the AI
  // Process all 22 worksheets in two batches to stay within token limits
  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = `You are converting Word doc worksheet prompts into JSON form schemas for a student incubator platform.

For each worksheet section in the text:
1. Identify the worksheet title (e.g. "Worksheet 1 – Personal Interests and Goals Reflection") — normalize it to "Worksheet N: <Title>" format with a colon
2. Extract the instructions paragraph(s) — the sentences telling students how to use the worksheet
3. For every student-facing prompt/question/blank, create a field:
   - Multi-line reflective/open-ended questions → "textarea"
   - Short fill-in-the-blank answers (e.g. "Academic subjects I enjoy: ____") → "text"
   - Lists / brainstorm areas → "textarea" with helpText "List one idea per line"
   - Part headers that contain sub-questions → create one field per sub-question
   - Rating scales / numbered choices → "radio" with appropriate options
   - Comparison tables (like the Existing Solutions chart) → one "textarea" per column concept
   - Checklist items → "multi_select" with options being the checklist items
   - Be faithful to the original prompts — keep label text natural and student-friendly
   - Generate snake_case key from label
   - Mark main 3-5 substantive reflection questions as required: true; optional for supplementary fields

Rules:
- Do NOT create fields for: cover page info, metadata lines (Name/Date/Lesson Connection/Student Use), "Design Reminder" static text
- DO create fields for every actual question or blank the student fills in
- For fill-in-the-blank lines like "Academic subjects I enjoy: ________", the label is "Academic subjects I enjoy" and type is "text"
- For large open reflection areas (multiple blank lines), use "textarea"
- Worksheet 6 is a comparison chart — create textarea fields for each column concept per row concept
- Worksheet 13 and 19 are checklists — use multi_select for each checklist section`;

  console.log("Sending to Claude for schema extraction…");

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: ResponseSchema,
    system: systemPrompt,
    prompt: `Here is the full text of the worksheet packet. Extract all 22 worksheets and their form fields:\n\n${rawText}`,
  });

  console.log(`Parsed ${object.worksheets.length} worksheets.`);

  const totalFields = object.worksheets.reduce(
    (sum, ws) => sum + ws.fields.length,
    0
  );
  console.log(`Total fields across all worksheets: ${totalFields}`);

  // Print sample
  if (object.worksheets[0]) {
    console.log("\nSample — Worksheet 1:");
    console.log(JSON.stringify(object.worksheets[0], null, 2));
  }

  // ─── Generate SQL migration ────────────────────────────────────────────────
  const sqlParts = [
    `-- ============================================================
-- CAS Incubator OS — Migration 0012
-- Populate worksheet_templates with real form schemas from
-- curriculum-part1-worksheets-v2.docx
-- Generated: ${new Date().toISOString().split("T")[0]}
-- Idempotent: UPDATE-only, safe to re-run
-- ============================================================
`,
  ];

  for (let i = 0; i < object.worksheets.length; i++) {
    sqlParts.push(buildUpdate(object.worksheets[i], i));
  }

  const sql = sqlParts.join("\n");
  const outPath = join(
    process.cwd(),
    "supabase/migrations/0012_worksheet_schemas.sql"
  );
  writeFileSync(outPath, sql, "utf8");
  console.log(`\nMigration written to: ${outPath}`);
  console.log(`SQL length: ${sql.length} chars`);

  // Summary
  console.log("\n=== Summary ===");
  for (const ws of object.worksheets) {
    console.log(`  ${ws.title}: ${ws.fields.length} fields`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
