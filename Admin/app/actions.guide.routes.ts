"use server";

import { db } from "@/lib/prisma";
import { getUserSession } from "@/app/actions.auth";

export async function getGuideRoutes() {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  const profile = await db.guideProfile.findUnique({ where: { userId: user.id }});
  if (!profile) throw new Error("Perfil de guia não encontrado");

  return await db.tourRoute.findMany({
    where: { guideId: profile.id },
    include: {
      places: {
        include: { place: true },
        orderBy: { order: "asc" }
      },
      _count: { select: { packages: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function createTourRoute(data: { title: string, description?: string, durationMinutes?: number }) {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  const profile = await db.guideProfile.findUnique({ where: { userId: user.id }});
  if (!profile) throw new Error("Perfil de guia não encontrado");

  return await db.tourRoute.create({
    data: {
      guideId: profile.id,
      title: data.title,
      description: data.description,
      durationMinutes: data.durationMinutes,
      status: "DRAFT"
    }
  });
}

export async function getTourRoute(routeId: string) {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  return await db.tourRoute.findUnique({
    where: { id: routeId },
    include: {
      places: {
        include: { place: true },
        orderBy: { order: "asc" }
      }
    }
  });
}

export async function updateTourRouteDetails(routeId: string, data: any) {
  return await db.tourRoute.update({
    where: { id: routeId },
    data
  });
}

export async function addPlaceToRoute(routeId: string, placeId: string, notes?: string) {
  // Discover current max order
  const existing = await db.routePlace.findMany({
    where: { routeId },
    orderBy: { order: 'desc' },
    take: 1
  });
  const order = existing.length > 0 ? existing[0].order + 1 : 0;

  return await db.routePlace.create({
    data: {
      routeId,
      placeId,
      order,
      notes
    }
  });
}

export async function removePlaceFromRoute(routeId: string, placeId: string) {
  return await db.routePlace.delete({
    where: {
      routeId_placeId: {
        routeId,
        placeId
      }
    }
  });
}

export async function updateRoutePlaceOrder(routeId: string, updates: {placeId: string, order: number}[]) {
  for (const update of updates) {
    await db.routePlace.update({
      where: { routeId_placeId: { routeId, placeId: update.placeId }},
      data: { order: update.order }
    });
  }
}

export async function searchPlacesForRoute(query: string) {
  return await db.place.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ]
    },
    take: 10,
    select: {
      id: true,
      name: true,
      address: true,
      coverImage: true,
      emoji: true,
      type: true
    }
  });
}
