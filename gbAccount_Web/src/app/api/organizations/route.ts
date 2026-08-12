import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      orderBy: {
        OrgID: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    console.error("Get organizations error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get organizations",
      },
      { status: 500 }
    );
  }
}