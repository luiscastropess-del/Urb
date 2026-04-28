"use server";

import { db } from "@urb/shared";

export async function getPublicGuideProfile(id: string) {
  try {
    const profile = await db.guideProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            email: true,
          }
        },
        packages: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' }
        },
        routes: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' }
        },
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true }
        }
      }
    });

    if (!profile) {
      return { error: "Perfil de guia não encontrado" };
    }

    // Determine the active plan
    let activePlan = "free";
    if (profile.subscriptions && profile.subscriptions.length > 0) {
      activePlan = profile.subscriptions[0].plan.name.toLowerCase();
    }

    if (activePlan === "free") {
      profile.packages = profile.packages.slice(0, 2);
      profile.routes = profile.routes.slice(0, 2);
    }

    return { 
      profile,
      activePlan,
    };
  } catch (error) {
    console.error("Erro ao carregar perfil de guia público:", error);
    return { error: "Erro ao consultar banco de dados" };
  }
}
