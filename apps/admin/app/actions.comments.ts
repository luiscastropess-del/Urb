"use server";

import { db } from "@repo/database";
import { getUserSession } from "@/app/actions.auth";

export async function getComments(placeId: string) {
  return await db.comment.findMany({
    where: { placeId },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addComment(placeId: string, text: string, rating: number) {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  return await db.comment.create({
    data: {
      text,
      rating,
      placeId,
      userId: user.id,
    },
  });
}
