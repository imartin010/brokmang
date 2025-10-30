import { NextRequest, NextResponse } from "next/server";
import { validateApiToken } from "@/lib/api-token";

export async function GET(request: NextRequest) {
  const auth = await validateApiToken(request as unknown as Request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { pathname } = new URL(request.url);
  const segments = pathname.split("/").filter(Boolean);
  // .../api/public/reports/{month}
  const month = segments[segments.length - 1];
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 });
  }

  return NextResponse.json({
    month,
    orgId: auth.orgId,
    status: "pending",
    message: "PDF generation service not yet implemented",
  });
}


