"use server";

import { db } from "@urb/shared";
import { getUserSession } from "./actions.auth";

const prisma = db;

// ----------------- PLANS -----------------

export async function createPlan(data: any) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        interval: data.interval,
        trialDays: parseInt(data.trialDays || "0", 10),
        features: data.features || [],
        isActive: data.isActive,
        externalPriceId: data.externalPriceId,
        provider: data.provider || "PAGDEV",
        publicProfile: data.publicProfile ?? true,
        maxTours: parseInt(data.maxTours || "1", 10),
        maxFeaturedTours: parseInt(data.maxFeaturedTours || "0", 10),
        supportEmail: data.supportEmail ?? false,
        premiumBadge: data.premiumBadge ?? false,
        vipProspector: data.vipProspector ?? false,
        touristChat: data.touristChat ?? false,
        cityMapHighlight: data.cityMapHighlight ?? false,
        advancedAnalytics: data.advancedAnalytics ?? false,
        vipProfileCustomization: data.vipProfileCustomization ?? false,
        priorityVerification: data.priorityVerification ?? false,
        supportWhatsapp247: data.supportWhatsapp247 ?? false,
      },
    });
    return { success: true, plan };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPlans() {
  try {
    const sessionUser = await getUserSession();
    if (!sessionUser) {
      console.warn("getPlans: No session found");
      throw new Error("Acesso negado: Faca login primeiro");
    }

    // Role check
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { role: true }
    });

    if (!dbUser) {
      throw new Error("Usuário não encontrado no banco");
    }

    // Admins see everything, others only active plans
    const plans = await prisma.plan.findMany({
      where: dbUser.role === "admin" ? undefined : { isActive: true },
      orderBy: { price: 'asc' },
    });
    
    return { success: true, plans, role: dbUser.role };
  } catch (error: any) {
    console.error("getPlans error:", error);
    return { success: false, error: error.message || "Erro desconhecido" };
  }
}

export async function updatePlan(id: string, data: any) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const plan = await prisma.plan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        interval: data.interval,
        trialDays: parseInt(data.trialDays || "0", 10),
        features: data.features || [],
        isActive: data.isActive,
        externalPriceId: data.externalPriceId,
        provider: data.provider || "PAGDEV",
        publicProfile: data.publicProfile ?? true,
        maxTours: parseInt(data.maxTours || "1", 10),
        maxFeaturedTours: parseInt(data.maxFeaturedTours || "0", 10),
        supportEmail: data.supportEmail ?? false,
        premiumBadge: data.premiumBadge ?? false,
        vipProspector: data.vipProspector ?? false,
        touristChat: data.touristChat ?? false,
        cityMapHighlight: data.cityMapHighlight ?? false,
        advancedAnalytics: data.advancedAnalytics ?? false,
        vipProfileCustomization: data.vipProfileCustomization ?? false,
        priorityVerification: data.priorityVerification ?? false,
        supportWhatsapp247: data.supportWhatsapp247 ?? false,
      },
    });
    return { success: true, plan };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePlan(id: string) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    await prisma.plan.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ----------------- COUPONS -----------------

export async function createCoupon(data: any) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        discount: parseFloat(data.discount),
        discountType: data.discountType,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });
    return { success: true, coupon };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCoupons() {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, coupons };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCoupon(id: string, data: any) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code,
        discount: parseFloat(data.discount),
        discountType: data.discountType,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });
    return { success: true, coupon };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(id: string) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    await prisma.coupon.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ----------------- SUBSCRIPTIONS -----------------

export async function getSubscriptions() {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        guide: {
          include: {
            user: true
          }
        },
        plan: true,
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, subscriptions };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSubscriptionStatus(id: string, data: { status?: string, paymentStatus?: string }) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    // Determine explicitly what to update to handle potential nulls if passed explicitly
    const updateData: any = {};
    if (data.status != null) updateData.status = data.status;
    if (data.paymentStatus != null) updateData.paymentStatus = data.paymentStatus;

    if (Object.keys(updateData).length === 0) return { success: false, error: "Nenhum dado fornecido para atualização válida" };

    const updated = await prisma.subscription.update({
      where: { id },
      data: updateData
    });
    return { success: true, subscription: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
