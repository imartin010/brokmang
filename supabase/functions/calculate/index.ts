// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.1";

// Supabase automatically provides these environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://eamywkblubazqmepaxmm.supabase.co";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Inputs = {
  agents: number;
  team_leaders: number;
  rent: number;
  salary: number;
  team_leader_share: number;
  others: number;
  marketing: number;
  sim: number;
  franchise_owner_salary: number;
  gross_rate: number;
  agent_comm_per_1m: number;
  tl_comm_per_1m: number;
  withholding: number;
  vat: number;
  income_tax: number;
};

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "content-type, x-user-id",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const inputs: Inputs = await req.json();

    // Validate inputs
    if (inputs.agents < 1) {
      throw new Error("At least 1 agent required");
    }

    if (inputs.team_leaders < 0) {
      throw new Error("Team leaders cannot be negative");
    }

    if (
      inputs.rent < 0 ||
      inputs.salary < 0 ||
      inputs.team_leader_share < 0 ||
      inputs.others < 0 ||
      inputs.marketing < 0 ||
      inputs.sim < 0 ||
      inputs.franchise_owner_salary < 0
    ) {
      throw new Error("Cost values cannot be negative");
    }

    if (inputs.gross_rate < 0 || inputs.gross_rate > 1) {
      throw new Error("Gross rate must be between 0 and 1");
    }

    if (inputs.agent_comm_per_1m < 0 || inputs.tl_comm_per_1m < 0) {
      throw new Error("Commission values cannot be negative");
    }

    if (
      inputs.withholding < 0 ||
      inputs.withholding > 1 ||
      inputs.vat < 0 ||
      inputs.vat > 1
    ) {
      throw new Error("Tax rates must be between 0 and 1");
    }

    if (inputs.income_tax < 0.07 || inputs.income_tax > 0.12) {
      throw new Error("Income tax must be between 0.07 (7%) and 0.12 (12%)");
    }

    // Calculate results
    const grossPer1M = 1_000_000 * inputs.gross_rate;
    const commissionsPer1M = inputs.agent_comm_per_1m + inputs.tl_comm_per_1m;
    const taxesPer1M =
      grossPer1M * (inputs.withholding + inputs.vat + inputs.income_tax);
    const netPer1M = grossPer1M - commissionsPer1M - taxesPer1M;

    const costPerSeat =
      inputs.rent +
      inputs.salary +
      inputs.team_leader_share +
      inputs.others +
      inputs.marketing +
      inputs.sim;
    const totalCost =
      costPerSeat * inputs.agents + inputs.franchise_owner_salary;

    // Handle division by zero
    if (netPer1M <= 0) {
      throw new Error(
        "Net revenue per 1M is zero or negative. Cannot calculate break-even point. Please adjust your commission and tax rates."
      );
    }

    const breakEvenSales = totalCost / (netPer1M / 1_000_000);

    const results = {
      cost_per_seat: costPerSeat,
      total_operating_cost: totalCost,
      gross_per_1m: grossPer1M,
      commissions_per_1m: commissionsPer1M,
      taxes_per_1m: taxesPer1M,
      net_rev_per_1m: netPer1M,
      break_even_sales_egp: breakEvenSales,
      break_even_sales_million: breakEvenSales / 1_000_000,
      steps: [
        { label: "Cost/Seat", value: costPerSeat },
        { label: "Total Operating", value: totalCost },
        { label: "Gross/1M", value: grossPer1M },
        { label: "Commissions/1M", value: commissionsPer1M },
        { label: "Taxes/1M", value: taxesPer1M },
        { label: "Net/1M", value: netPer1M },
      ],
    };

    // Optional persist (requires user_id in header)
    const userId = req.headers.get("x-user-id");
    if (userId && userId.length > 0) {
      try {
        const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
        await sb.from("break_even_records").insert({
          user_id: userId,
          inputs,
          results,
        });
      } catch (dbError) {
        console.error("Database insert error:", dbError);
        // Don't fail the request if DB insert fails
      }
    }

    return new Response(JSON.stringify(results), {
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e: any) {
    console.error("Calculation error:", e);
    return new Response(
      JSON.stringify({ error: e.message || String(e) }),
      {
        status: 400,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

