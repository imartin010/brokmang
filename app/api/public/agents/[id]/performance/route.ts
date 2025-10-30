import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateApiToken } from "@/lib/api-token";

export async function GET(request: NextRequest) {
  const auth = await validateApiToken(request as unknown as Request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { pathname } = new URL(request.url);
  const segments = pathname.split("/").filter(Boolean);
  // .../api/public/agents/{id}/performance
  const agentsIndex = segments.findIndex((s) => s === "agents");
  const userId = agentsIndex >= 0 ? segments[agentsIndex + 1] : undefined;
  if (!userId) return NextResponse.json({ error: "Missing agent id" }, { status: 400 });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: logs, error } = await sb
    .from("agent_daily_logs")
    .select("deals, revenue")
    .eq("user_id", userId)
    .eq("org_id", auth.orgId)
    .limit(1000);

  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });

  const totals = (logs || []).reduce(
    (acc, row: any) => {
      acc.deals += row.deals || 0;
      acc.revenue += row.revenue || 0;
      return acc;
    },
    { deals: 0, revenue: 0 }
  );

  return NextResponse.json({ agentId: userId, orgId: auth.orgId, totals });
}


