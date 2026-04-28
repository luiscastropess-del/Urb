import { NextRequest, NextResponse } from "next/server";
import { db } from "@urb/shared";

export async function GET(req: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    const ADMIN_URL = req.nextUrl.origin || "https://adm-urbano.onrender.com";
    const PGUIA_URL = process.env.NEXT_PUBLIC_PGUIA_URL || "https://local-urbano.onrender.com";
    
    const plansWithUrls = plans.map(plan => ({
      ...plan,
      checkoutUrl: `${ADMIN_URL}/subscribe/${plan.id}?external=1&redirect=${PGUIA_URL}`
    }));

    return NextResponse.json(plansWithUrls, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("DEBUG: Failed to fetch plans:", error);
    return NextResponse.json({ 
      error: "Failed to fetch plans", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
