import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const inputs = await req.json();
    
    // Check if Supabase URL is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error("NEXT_PUBLIC_SUPABASE_URL is not configured");
      return NextResponse.json(
        { error: "Supabase configuration missing. Please configure NEXT_PUBLIC_SUPABASE_URL environment variable." },
        { status: 500 }
      );
    }
    
    // Call Supabase Edge Function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/calculate`;
    
    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": inputs.user_id ?? "",
      },
      body: JSON.stringify(inputs),
    });

    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("Edge function returned non-JSON response:", text);
      return NextResponse.json(
        { error: `Edge function error: ${text || response.statusText}` },
        { status: response.status || 500 }
      );
    }
    
    if (!response.ok) {
      console.error("Edge function error:", data);
      return NextResponse.json(
        { error: data.error || data.message || "Calculation failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in calculate route:", error);
    return NextResponse.json(
      { 
        error: "Failed to calculate",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}

