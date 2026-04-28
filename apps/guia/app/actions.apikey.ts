"use server";

import { db } from "@urb/shared";
import { getUserSession } from "./actions.auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function getDeveloperKeys() {
  const session = await getUserSession();
  if (!session) {
    return [];
  }

  try {
    return await db.developerApiKey.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error fetching developer api keys:", error);
    return [];
  }
}

export async function generateDeveloperKey(name: string) {
  const session = await getUserSession();
  if (!session) {
    return { error: "Não autorizado" };
  }

  try {
    // Generate a secure looking API key prefix
    const key = `sk_live_${uuidv4().replace(/-/g, '')}`;
    
    const newKey = await db.developerApiKey.create({
      data: {
        userId: session.id,
        key: key,
        name: name || "Default Key",
      }
    });

    revalidatePath("/dashboard/guia/plugins/docs");
    return { success: true, key: newKey };
  } catch (error) {
    console.error("Error generating api key:", error);
    return { error: "Falha ao gerar chave" };
  }
}

export async function deleteDeveloperKey(id: string) {
  const session = await getUserSession();
  if (!session) {
    return { error: "Não autorizado" };
  }

  try {
    const key = await db.developerApiKey.findFirst({
      where: { id, userId: session.id }
    });

    if (!key) {
      return { error: "Chave não encontrada ou sem permissão" };
    }

    await db.developerApiKey.delete({
      where: { id }
    });

    revalidatePath("/dashboard/guia/plugins/docs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting api key:", error);
    return { error: "Falha ao excluir chave" };
  }
}
