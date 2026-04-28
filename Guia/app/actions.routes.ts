"use server";

import { db } from "@/lib/prisma";
import { getUserSession } from "./actions.auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const user = await getUserSession();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
}

export async function getApiRoutes() {
  await requireAdmin();
  return await db.apiRoute.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function upsertApiRoute({
  name,
  url,
  method = "GET",
  description,
  isActive
}: {
  name: string;
  url: string;
  method?: string;
  description?: string;
  isActive?: boolean;
}) {
  await requireAdmin();

  // Se já existe, atualiza. Se não, cria.
  const route = await db.apiRoute.upsert({
    where: { name },
    update: {
      url,
      method,
      description,
      isActive: isActive !== undefined ? isActive : true,
    },
    create: {
      name,
      url,
      method,
      description,
      isActive: isActive !== undefined ? isActive : true,
    }
  });

  revalidatePath('/admin/settings/routes');
  return route;
}

export async function deleteApiRoute(id: string) {
  await requireAdmin();
  
  await db.apiRoute.delete({
    where: { id }
  });

  revalidatePath('/admin/settings/routes');
  return { success: true };
}

export async function toggleApiRouteStatus(id: string, isActive: boolean) {
  await requireAdmin();

  await db.apiRoute.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath('/admin/settings/routes');
  return { success: true };
}
