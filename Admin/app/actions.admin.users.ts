"use server";

import { db } from "@repo/database";
import { getUserSession } from "./actions.auth";

const prisma = db;

export async function getUsers() {
  try {
    const user = await getUserSession();
    if (!user || user.role !== "admin") {
      console.warn("getUsers: unauthorized access attempt", user?.email);
      return { success: false, error: "Acesso negado" };
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        avatar: true,
        level: true,
        xp: true,
        createdAt: true,
      }
    });
    console.log(`getUsers: returning ${users.length} users`);
    return { success: true, users };
  } catch (error: any) {
    console.error("getUsers: error", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserRole(id: string, role: string) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });
    return { success: true, user: updatedUser };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getActivities() {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: { name: true, avatar: true }
        },
        place: {
          select: { name: true }
        }
      }
    });
    return { success: true, activities };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(id: string) {
  const user = await getUserSession();
  if (!user || user.role !== "admin") throw new Error("Acesso negado");

  try {
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
