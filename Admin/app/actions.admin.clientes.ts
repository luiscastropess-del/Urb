"use server";

import { db } from "@/lib/prisma";
import { getUserSession } from "./actions.auth";

const prisma = db;

export async function getClientes() {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const clientes = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        paymentStatus: true,
        level: true,
        xp: true,
        createdAt: true,
      }
    });
    return { success: true, clientes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateClientePlan(id: string, plan: string, paymentStatus: string) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const cliente = await prisma.user.update({
      where: { id },
      data: { plan, paymentStatus }
    });
    return { success: true, cliente };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCliente(id: string) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approvePayment(id: string) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const cliente = await prisma.user.update({
      where: { id },
      data: { paymentStatus: "PAID" }
    });
    return { success: true, cliente };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function cancelPlan(id: string) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const cliente = await prisma.user.update({
      where: { id },
      data: { plan: "free", paymentStatus: "CANCELLED" }
    });
    return { success: true, cliente };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
