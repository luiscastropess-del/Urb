"use strict";
"use server";

import { db } from "@/lib/prisma";
import { getUserSession } from "@/app/actions.auth";
import { revalidatePath } from "next/cache";

export async function getActivePlans() {
  try {
    const response = await fetch("https://adm-urbano.onrender.com/api/external/plans", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    
    if (!response.ok) {
      console.warn("Aviso: Falha ao buscar planos externos. Usando plano local.");
      return await db.plan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
      });
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.plans || []);
  } catch (error) {
    console.warn("Aviso: Não foi possível acessar a API de planos externos. Usando fallback local.");
    // Fallback to local database if external API fails
    return await db.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
  }
}

export async function getPlans() {
  const session = await getUserSession();
  if (!session || session.role !== "admin") {
    throw new Error("Não autorizado");
  }
  return await db.plan.findMany({
    orderBy: { price: "asc" },
  });
}

export async function createPlan(data: any) {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Não autorizado");

  const plan = await db.plan.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      interval: data.interval,
      trialDays: data.trialDays,
      features: data.features,
      isActive: data.isActive,
    },
  });
  revalidatePath("/dashboard/admin/planos");
  return plan;
}

export async function updatePlan(id: string, data: any) {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Não autorizado");

  const plan = await db.plan.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      interval: data.interval,
      trialDays: data.trialDays,
      features: data.features,
      isActive: data.isActive,
    },
  });
  revalidatePath("/dashboard/admin/planos");
  return plan;
}

export async function deletePlan(id: string) {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Não autorizado");

  await db.plan.delete({ where: { id } });
  revalidatePath("/dashboard/admin/planos");
  return true;
}

export async function getCoupons() {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Não autorizado");

  return await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCoupon(data: any) {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Não autorizado");

  const coupon = await db.coupon.create({
    data: {
      code: data.code,
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive,
    },
  });
  revalidatePath("/dashboard/admin/cupons");
  return coupon;
}

export async function updateCoupon(id: string, data: any) {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Não autorizado");

  const coupon = await db.coupon.update({
    where: { id },
    data: {
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive,
    },
  });
  revalidatePath("/dashboard/admin/cupons");
  return coupon;
}

export async function deleteCoupon(id: string) {
  const session = await getUserSession();
  if (!session || session.role !== "admin") throw new Error("Não autorizado");

  await db.coupon.delete({ where: { id } });
  revalidatePath("/dashboard/admin/cupons");
  return true;
}

export async function checkoutExternalPlan(planId: string, userId: string) {
  try {
    const response = await fetch("https://adm-urbano.onrender.com/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        isExternal: true,
        userId
      })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Erro no servidor externo");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erro no checkout no servidor externo:", error);
    throw error;
  }
}
