"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getUserSession, addXp } from "@/app/actions.auth";

export async function getPlaces() {
  return await db.place.findMany();
}

export async function getEvents() {
  return await db.event.findMany();
}

export async function getFavorites() {
  const session = await getUserSession();
  if (!session) return [];
  return await db.favorite.findMany({ 
    where: { userId: session.id },
    include: { place: true } 
  });
}

export async function getPlace(id: string) {
  return await db.place.findUnique({ 
    where: { id },
    include: {
      photos: true,
      googleReviews: true,
      openingHours: true,
      menuLink: true,
    }
  });
}

export async function createPlace(data: {
  name: string;
  emoji: string;
  rating: number;
  reviews: string;
  distance: string;
  type: string;
  featured: boolean;
  premium: boolean;
  description?: string;
  tags?: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
  phone?: string;
  instagram?: string;
  website?: string;
  email?: string;
  plan?: string;
  coverImage?: string;
  profileImage?: string;
  images?: string;
}) {
  const result = await db.place.create({ data });
  revalidatePath('/explore');
  return result;
}

export async function updatePlace(id: string, data: Partial<{
  name: string;
  emoji: string;
  rating: number;
  reviews: string;
  distance: string;
  type: string;
  featured: boolean;
  premium: boolean;
  description?: string;
  tags?: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
  phone?: string;
  instagram?: string;
  website?: string;
  email?: string;
  plan?: string;
  coverImage?: string;
  profileImage?: string;
  images?: string;
}>) {
  const result = await db.place.update({ where: { id }, data });
  revalidatePath('/explore');
  return result;
}

export async function deletePlace(id: string) {
  const result = await db.place.delete({ where: { id } });
  revalidatePath('/explore');
  return result;
}

export async function toggleFavorite({ placeId, collection }: { placeId: string, collection?: string }) {
  const session = await getUserSession();
  if (!session) {
    throw new Error('Você precisa estar logado para favoritar locais.');
  }

  const exist = await db.favorite.findFirst({ where: { placeId, userId: session.id } });
  if (exist) {
    await db.favorite.delete({ where: { id: exist.id } });
    
    // Remove activity record
    await db.activity.deleteMany({
      where: { userId: session.id, placeId, type: 'FAVORITE' }
    });

    revalidatePath('/favorites');
    revalidatePath('/explore');
    revalidatePath('/place/' + placeId);
    return { status: 'removed' };
  } else {
    await db.favorite.create({
      data: {
        placeId,
        userId: session.id,
        collection: collection || 'Geral'
      }
    });

    // Track activity
    const place = await db.place.findUnique({ where: { id: placeId } });
    await db.activity.create({
      data: {
        userId: session.id,
        placeId,
        type: 'FAVORITE',
        description: `Favoritou ${place?.name}`,
        xpEarned: 5
      }
    });

    // Add XP
    await addXp(session.id, 5);

    revalidatePath('/favorites');
    revalidatePath('/explore');
    revalidatePath('/place/' + placeId);
    revalidatePath('/profile');
    return { status: 'added' };
  }
}

export async function createCheckIn(placeId: string) {
  const session = await getUserSession();
  if (!session) throw new Error('Auth required');

  const place = await db.place.findUnique({ where: { id: placeId } });
  
  const checkin = await db.checkIn.create({
    data: {
      userId: session.id,
      placeId
    }
  });

  await db.activity.create({
    data: {
      userId: session.id,
      placeId,
      type: 'CHECK_IN',
      description: `Fez check-in no ${place?.name}`,
      xpEarned: 15
    }
  });

  await addXp(session.id, 15);

  revalidatePath('/profile');
  return checkin;
}

