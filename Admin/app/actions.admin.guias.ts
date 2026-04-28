"use server";

/**
 * CRITICAL: Guide Management Logic
 * This file is the source of truth for admin guide actions.
 * DO NOT switch to mock data or external APIs for core guide management.
 * Database connection via Prisma is MANDATORY.
 * This configuration is LOCKED to prevent disconnection during updates.
 */

import { db } from "@/lib/prisma";
import { getUserSession } from "@/app/actions.auth";

export async function updateGuideMetadata(profileId: string, metadata: any) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  return await db.guideProfile.update({
    where: { id: profileId },
    data: { metadata: JSON.stringify(metadata) }
  });
}

export async function getGuides() {
  try {
    const user = await getUserSession();
    if (!user) {
      console.warn("getGuides: No user session");
      throw new Error("Acesso negado: Sessão não encontrada");
    }
    
    if (user.role !== "admin") {
      console.warn(`getGuides: User ${user.email} is not an admin (role: ${user.role})`);
      throw new Error("Acesso negado: Apenas administradores podem ver guias");
    }

    const guides = await db.guideProfile.findMany({
      include: {
        user: true,
        _count: {
          select: { routes: true, packages: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    return guides;
  } catch (error: any) {
    console.error("getGuides error:", error);
    throw new Error(error.message || "Erro desconhecido ao carregar guias");
  }
}

export async function updateGuideStatus(profileId: string, status: string, commissionRate?: number) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  const data: any = { status };
  if (commissionRate !== undefined) {
    data.commissionRate = commissionRate;
  }

  // Update profile
  const profile = await db.guideProfile.update({
    where: { id: profileId },
    data
  });

  // If approved, ensure user has guide role or keep admin
  if (status === "APPROVED") {
     const existingUser = await db.user.findUnique({ where: { id: profile.userId }});
     if (existingUser && existingUser.role !== "admin") {
       await db.user.update({
         where: { id: profile.userId },
         data: { role: "guide" }
       });
     }
  } else if (status === "BLOCKED" || status === "REJECTED") {
     // Optional: downgrade role to user if they are blocked
     const existingUser = await db.user.findUnique({ where: { id: profile.userId }});
     if (existingUser && existingUser.role !== "admin") {
        await db.user.update({
           where: { id: profile.userId },
           data: { role: "user" }
        });
     }
  }

  return profile;
}

export async function updateGuideProfileData(profileId: string, data: { status?: string, commissionRate?: number, bio?: string, languages?: string[], pixKey?: string, plan?: string }) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  const profile = await db.guideProfile.findUnique({ where: { id: profileId } });
  if (!profile) throw new Error("Guia não encontrado");

  // Update guide profile
  const profileData: any = {};
  if (data.status !== undefined) profileData.status = data.status;
  if (data.commissionRate !== undefined) profileData.commissionRate = data.commissionRate;
  if (data.bio !== undefined) profileData.bio = data.bio;
  if (data.languages !== undefined) profileData.languages = data.languages;
  if (data.pixKey !== undefined) profileData.pixKey = data.pixKey;

  if (Object.keys(profileData).length > 0) {
    await db.guideProfile.update({
      where: { id: profileId },
      data: profileData
    });
  }

  // Update user plan
  if (data.plan !== undefined) {
    await db.user.update({
      where: { id: profile.userId },
      data: { plan: data.plan }
    });
  }
  
  return { success: true };
}
// Trigger build