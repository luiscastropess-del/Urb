import { NextResponse } from "next/server";
import { db } from "@urb/shared";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const packages = await db.tourPackage.findMany({
      where: {
        status: "PUBLISHED",
      },
      take: limit,
      include: {
        guide: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              }
            }
          }
        },
        routes: {
          include: {
            places: {
              include: {
                place: true
              },
              orderBy: {
                order: "asc"
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(packages, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      }
    });
  } catch (error) {
    console.error("Error fetching public packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
