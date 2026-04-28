"use server";

import { db } from "@repo/database";
import { revalidatePath } from "next/cache";
import { processImageUpload } from "@/lib/githubStorage";

export async function getCities() {
  return await db.city.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getCityById(id: string) {
  return await db.city.findUnique({
    where: { id }
  });
}

export async function createCity(data: {
  name: string;
  state?: string;
  description?: string;
  profileImage?: string;
  coverImage?: string;
  galleryImages?: string[];
  featured?: boolean;
}) {
  if (data.profileImage) data.profileImage = await processImageUpload(data.profileImage);
  if (data.coverImage) data.coverImage = await processImageUpload(data.coverImage);
  if (data.galleryImages && Array.isArray(data.galleryImages)) {
    data.galleryImages = await Promise.all(data.galleryImages.map(img => processImageUpload(img)));
  }

  const city = await db.city.create({
    data: {
      ...data,
      galleryImages: data.galleryImages || []
    }
  });
  revalidatePath("/admin/cities");
  return city;
}

export async function updateCity(id: string, data: {
  name?: string;
  state?: string;
  description?: string;
  profileImage?: string;
  coverImage?: string;
  galleryImages?: string[];
  featured?: boolean;
}) {
  if (data.profileImage) data.profileImage = await processImageUpload(data.profileImage);
  if (data.coverImage) data.coverImage = await processImageUpload(data.coverImage);
  if (data.galleryImages && Array.isArray(data.galleryImages)) {
    data.galleryImages = await Promise.all(data.galleryImages.map(img => processImageUpload(img)));
  }

  const city = await db.city.update({
    where: { id },
    data
  });
  revalidatePath("/admin/cities");
  return city;
}

export async function deleteCity(id: string) {
  const city = await db.city.delete({
    where: { id }
  });
  revalidatePath("/admin/cities");
  return city;
}
