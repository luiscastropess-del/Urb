"use server";

import { db } from "@urb/shared";
import { revalidatePath } from "next/cache";
import { getUserSession } from "@/app/actions.auth";

export async function getPosts() {
  return await db.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, email: true } } },
  });
}

export async function upsertPost(data: any) {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");
  
  if (data.coverImage && data.coverImage.startsWith("data:image")) {
    // Salvamos a imagem como base64 por enquanto
    // Futuramente pode integrar com GitHub Storage
    data.coverImage = data.coverImage;
  }

  let post;
  if (data.id) {
    post = await db.post.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        status: data.status,
        tags: data.tags,
        coverImage: data.coverImage,
      },
    });
  } else {
    post = await db.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        status: data.status,
        authorId: session.id,
        tags: data.tags,
        coverImage: data.coverImage,
      },
    });
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return post;
}

export async function deletePost(id: string) {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");
  
  await db.post.delete({ where: { id } });
  
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: true };
}
