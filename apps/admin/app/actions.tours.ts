"use server";

import { db } from "@repo/database";

export async function getPublicPackage(id: string) {
  return await db.tourPackage.findUnique({
    where: { 
      id,
      status: { in: ["PUBLISHED", "PREMIUM"] }
    },
    include: {
      guide: {
        include: { user: true }
      },
      routes: {
        include: {
          places: {
            include: { place: true }
          }
        }
      },
      _count: { select: { reviews: true } }
    }
  });
}
export async function getPublicPackages() {
  return await db.tourPackage.findMany({
    where: { status: { in: ["PUBLISHED", "PREMIUM"] } },
    include: {
      guide: {
        include: { user: true }
      },
      routes: {
        include: {
          places: {
            include: { place: true }
          }
        }
      },
      _count: { select: { reviews: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function getPremiumPackages() {
  return await db.tourPackage.findMany({
    where: { status: "PREMIUM" },
    include: {
      guide: {
        include: { user: true }
      },
      routes: {
        include: {
          places: {
            include: { place: true }
          }
        }
      },
      _count: { select: { reviews: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });
}

export async function getFeaturedCities() {
  return await db.city.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getPremiumGuides() {
  return await db.guideProfile.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
    orderBy: { user: { xp: "desc" } },
    take: 10
  });
}

export async function getAllGuides() {
  return await db.guideProfile.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });
}
