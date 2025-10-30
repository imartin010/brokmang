import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateApiToken } from "@/lib/api-token";

export async function GET(request: NextRequest) {
  const auth = await validateApiToken(request as unknown as Request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch the latest break-even record for the organization
  const { data, error } = await sb
    .from("break_even_records")
    .select("id, created_at, results")
    .eq("org_id", auth.orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "No records" }, { status: 404 });

  return NextResponse.json({ breakEven: data.results });
}


