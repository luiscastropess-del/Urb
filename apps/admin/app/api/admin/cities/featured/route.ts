import { NextResponse } from "next/server";
import { db } from "@urb/shared";

export async function GET() {
  try {
    const featuredCities = await db.city.findMany({
      where: {
        featured: true,
      },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json({
      success: true,
      data: featuredCities,
    }, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    console.error("Error fetching featured cities:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
