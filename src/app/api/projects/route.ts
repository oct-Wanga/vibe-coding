import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/shared/supabase";

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const sp = req.nextUrl.searchParams;

  const q = sp.get("q")?.trim() ?? "";
  const status = sp.get("status"); // "active" | "archived" | null

  let query = supabase.from("projects").select("*").order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (status === "active" || status === "archived") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
