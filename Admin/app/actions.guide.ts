"use server";

import { db } from "@repo/database";
import { getUserSession } from "@/app/actions.auth";

export async function getGuideProfile() {
  const user = await getUserSession();
  if (!user) return { error: "Não autenticado" };

  try {
    let profile = await db.guideProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile && (user.role === "guide" || user.role === "admin")) {
      profile = await db.guideProfile.create({
        data: {
          userId: user.id,
          status: "APPROVED", // Auto-approve if they already have the role or are admin
        },
      });
    }

    return { profile, user };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function registerAsGuide(data: { bio: string; languages: string[]; pixKey?: string }) {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  const existing = await db.guideProfile.findUnique({
    where: { userId: user.id },
  });

  if (existing) {
    const isUpdatingToApproved = user.role === "admin" && existing.status !== "APPROVED";
    return await db.guideProfile.update({
      where: { userId: user.id },
      data: {
        ...data,
        ...(isUpdatingToApproved ? { status: "APPROVED" } : {})
      },
    });
  }

  const profile = await db.guideProfile.create({
    data: {
      userId: user.id,
      bio: data.bio,
      languages: data.languages,
      pixKey: data.pixKey,
      status: user.role === "admin" ? "APPROVED" : "PENDING",
    },
  });

  return profile;
}
