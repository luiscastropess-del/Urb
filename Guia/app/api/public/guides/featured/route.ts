import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const guides = await db.guideProfile.findMany({
      where: {
        status: "APPROVED",
        featured: true,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        rating: 'desc',
      }
    });

    const formattedGuides = guides.map((guide) => ({
      id: guide.id,
      userId: guide.userId,
      name: guide.user.name,
      profileImage: guide.user.avatar,
      rating: guide.rating || 0,
      totalKm: guide.totalKm || 0,
      description: guide.bio || "",
      languages: guide.languages,
      featured: guide.featured,
    }));

    return NextResponse.json(formattedGuides, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      }
    });
  } catch (error) {
    console.error("Error fetching featured guides:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
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
