import { NextResponse } from "next/server";
import { db } from "@urb/shared";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await db.tourPackage.findUnique({
      where: { id },
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
        },
        reviews: {
          include: {
            customer: {
              select: {
                name: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
    }

    return NextResponse.json(pkg, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      }
    });
  } catch (error) {
    console.error("Error fetching public package details:", error);
    return NextResponse.json({ error: "Failed to fetch package details" }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
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
