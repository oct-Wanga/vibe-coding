import type { SupabaseClient } from "@supabase/supabase-js";

type ActivityLogInput = {
  type: string;
  message: string;
  actor?: string | null;
};

export async function insertActivityLog(
  supabase: SupabaseClient,
  { type, message, actor }: ActivityLogInput,
) {
  return supabase.from("activity_logs").insert({
    id: crypto.randomUUID(),
    type,
    message,
    actor: actor ?? "anonymous",
    created_at: new Date().toISOString(),
  });
}
