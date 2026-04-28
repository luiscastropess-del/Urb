import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const planCount = await db.plan.count();
    const userCount = await db.user.count();
    const guideCount = await db.guideProfile.count();
    
    return NextResponse.json({
      success: true,
      counts: {
        plans: planCount,
        users: userCount,
        guides: guideCount
      },
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.split(":")[0],
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
