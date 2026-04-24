import { getServiceClient } from "@/lib/supabase";

export interface AiUsageLogEntry {
  userId?: string;
  route: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
}

export async function logAiUsage(entry: AiUsageLogEntry): Promise<void> {
  try {
    const supabase = getServiceClient();
    await supabase.from("ai_usage_log").insert({
      user_id: entry.userId ?? null,
      route: entry.route,
      model: entry.model,
      tokens_input: entry.tokensInput,
      tokens_output: entry.tokensOutput,
    });
  } catch (err) {
    // Never block the main AI call on logging failures
    console.error("[ai-usage-log] failed to log usage:", err);
  }
}
