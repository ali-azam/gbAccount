import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Bypass SSL certificate check for self-signed ASP.NET Core developer certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:5201/api/AccCharts");
    if (!res.ok) {
      throw new Error(`C# API returned status ${res.status}`);
    }
    const json = await res.json();

    if (json.success) {
      return NextResponse.json({
        success: true,
        data: json.data,
      });
    } else {
      return NextResponse.json(
        { success: false, message: json.message || "Failed to load accounts from .NET API" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("GET accounts proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load accounts from .NET API", error: error.message },
      { status: 500 }
    );
  }
}