import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const inputs = await req.json();
    
    // Call Supabase Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/calculate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": inputs.user_id ?? "",
        },
        body: JSON.stringify(inputs),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in calculate route:", error);
    return NextResponse.json(
      { error: "Failed to calculate" },
      { status: 500 }
    );
  }
}

