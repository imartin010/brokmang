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

  // Fetch the latest break-even record
  // Note: break_even_records uses user_id (org_id was removed)
  // Since organizations are removed, we'll need to update this API to use user_id from token
  // For now, return error as this endpoint needs refactoring
  return NextResponse.json(
    { error: "This endpoint requires refactoring after organization removal. Use user-based endpoints instead." },
    { status: 501 }
  );
}


