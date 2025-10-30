import { NextRequest, NextResponse } from "next/server";
import { validateApiToken } from "@/lib/api-token";

export async function GET(request: NextRequest, { params }: { params: { month: string } }) {
  const auth = await validateApiToken(request as unknown as Request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const month = params.month;
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 });
  }

  // Placeholder until PDF generation is implemented
  return NextResponse.json({
    month,
    orgId: auth.orgId,
    status: "pending",
    message: "PDF generation service not yet implemented",
  });
}


