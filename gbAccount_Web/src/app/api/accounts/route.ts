import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accounts = await prisma.accChart.findMany({
      orderBy: {
        AccCode: "asc",
      },
      include: {
        AccCategory: true,
        Organization: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Get accounts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get accounts",
      },
      { status: 500 }
    );
  }
}