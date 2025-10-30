import { createClient } from "@supabase/supabase-js";

export type ApiAuthResult = { ok: true; orgId: string } | { ok: false; status: number; error: string };

export async function validateApiToken(request: Request): Promise<ApiAuthResult> {
  const token = request.headers.get("x-api-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false, status: 401, error: "Missing API token" };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) return { ok: false, status: 500, error: "Server not configured" };

  const sb = createClient(url, serviceKey);
  const { data, error } = await sb
    .from("api_tokens")
    .select("org_id, revoked, expires_at")
    .eq("token", token)
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false, status: 500, error: "Token lookup failed" };
  if (!data) return { ok: false, status: 401, error: "Invalid token" };
  if (data.revoked) return { ok: false, status: 401, error: "Token revoked" };
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { ok: false, status: 401, error: "Token expired" };

  return { ok: true, orgId: data.org_id };
}


