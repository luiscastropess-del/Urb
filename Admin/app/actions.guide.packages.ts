"use server";

import { db } from "@/lib/prisma";
import { getUserSession } from "@/app/actions.auth";

export async function getGuidePackages() {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  const profile = await db.guideProfile.findUnique({ where: { userId: user.id }});
  if (!profile) throw new Error("Perfil de guia não encontrado");

  return await db.tourPackage.findMany({
    where: { guideId: profile.id },
    include: {
      routes: true,
      _count: { select: { reservations: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function createTourPackage(data: { title: string, price: number }) {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  const profile = await db.guideProfile.findUnique({ where: { userId: user.id }});
  if (!profile) throw new Error("Perfil de guia não encontrado");

  return await db.tourPackage.create({
    data: {
      guideId: profile.id,
      title: data.title,
      price: data.price,
      status: "DRAFT"
    }
  });
}

export async function getTourPackage(id: string) {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  return await db.tourPackage.findUnique({
    where: { id },
    include: {
      routes: {
         include: {
            places: { include: { place: true }, orderBy: { order: "asc" } }
         }
      }
    }
  });
}

export async function updateTourPackageDetails(id: string, data: any) {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  return await db.tourPackage.update({
    where: { id },
    data
  });
}

export async function addRouteToPackage(packageId: string, routeId: string) {
   const user = await getUserSession();
   if (!user) throw new Error("Não autenticado");
   
   return await db.tourPackage.update({
     where: { id: packageId },
     data: {
       routes: {
         connect: { id: routeId }
       }
     }
   });
}

export async function removeRouteFromPackage(packageId: string, routeId: string) {
   const user = await getUserSession();
   if (!user) throw new Error("Não autenticado");
   
   return await db.tourPackage.update({
     where: { id: packageId },
     data: {
       routes: {
         disconnect: { id: routeId }
       }
     }
   });
}
