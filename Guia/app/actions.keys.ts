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

export async function getApiKeys() {
  await requireAdmin();
  return await db.apiKey.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function upsertApiKey({
  provider,
  key,
  description,
  isActive
}: {
  provider: string;
  key: string;
  description?: string;
  isActive?: boolean;
}) {
  await requireAdmin();

  // Se já existe, atualiza. Se não, cria.
  // Prisma upsert usa findUnique, por isso provider tem q ser @unique
  const apiKey = await db.apiKey.upsert({
    where: { provider },
    update: {
      key,
      description,
      isActive: isActive !== undefined ? isActive : true,
    },
    create: {
      provider,
      key,
      description,
      isActive: isActive !== undefined ? isActive : true,
    }
  });

  revalidatePath('/admin/settings/keys');
  return apiKey;
}

export async function deleteApiKey(id: string) {
  await requireAdmin();
  
  await db.apiKey.delete({
    where: { id }
  });

  revalidatePath('/admin/settings/keys');
  return { success: true };
}

export async function toggleApiKeyStatus(id: string, isActive: boolean) {
  await requireAdmin();

  await db.apiKey.update({
    where: { id },
    data: { isActive }
  });

  revalidatePath('/admin/settings/keys');
  return { success: true };
}
