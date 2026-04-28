"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  const city = await db.city.create({
    data: {
      ...data,
      galleryImages: data.galleryImages || []
    }
  });
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
  const city = await db.city.update({
    where: { id },
    data
  });
  return city;
}

export async function deleteCity(id: string) {
  const city = await db.city.delete({
    where: { id }
  });
  return city;
}
