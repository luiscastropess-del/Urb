"use server";

import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "urbano-holambra-secret-key-development"
);

async function createSession(user: any) {
  const token = await new SignJWT({ 
      id: user.id, 
      role: user.role, 
      name: user.name, 
      email: user.email,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
    })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  // Configurações otimizadas para funcionamento em iFrame (AI Studio)
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: true, // Sempre secure para SameSite=None
    sameSite: "none", // Necessário para iFrames cross-site
    partitioned: true, // CHIPS support para iFrames modernos
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function registerUser(data: any) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { success: false, error: "Este e-mail já está em uso" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.email === "luiscastropess@gmail.com" ? "admin" : "guide"
      }
    });

    // Removido o login automático para seguir o fluxo de redirecionar para a aba de login
    return { success: true };
  } catch (error: any) {
    console.error("Register Error:", error);
    return { success: false, error: "Ocorreu um erro ao criar a conta" };
  }
}

export async function loginUser(data: any) {
  try {
    const user = await db.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      return { success: false, error: "Credenciais inválidas" };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      return { success: false, error: "Credenciais inválidas" };
    }

    if (user.role !== "admin" && user.role !== "guide") {
      return { success: false, error: "Acesso restrito a guias e administradores" };
    }

    await createSession(user);

    return { success: true };
  } catch (error: any) {
    console.error("Login Error:", error);
    return { success: false, error: "Ocorreu um erro ao fazer login" };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  return { success: true };
}

export async function getUserSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    const verified = await jwtVerify(token, SECRET_KEY);
    const payload = verified.payload as any;
    
    // Busca dados atualizados do banco para garantir consistência (especialmente role)
    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        level: true,
        xp: true,
        createdAt: true
      }
    });

    return user;
  } catch (err) {
    console.error("Session verification failed:", err);
    return null;
  }
}

export async function getProfileStats(userId: string) {
  const favoritesCount = await db.favorite.count({
    where: { userId }
  });

  const reviewsCount = await db.review.count({
    where: { userId }
  });

  const checkinsCount = await db.checkIn.count({
    where: { userId }
  });

  return {
    favorites: favoritesCount,
    reviews: reviewsCount,
    checkins: checkinsCount
  };
}

export async function getRecentActivities(userId: string) {
  return await db.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { place: true }
  });
}

export async function addXp(userId: string, amount: number) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const newXp = (user.xp || 0) + amount;
  // Simple level formula: level = floor(newXp / 500) + 1
  const newLevel = Math.floor(newXp / 500) + 1;

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel
    }
  });

  // If level up, track it
  if (newLevel > user.level) {
    await db.activity.create({
      data: {
        userId,
        type: 'LEVEL_UP',
        description: `Subiu para o nível ${newLevel}! 🛡️`,
        xpEarned: 0
      }
    });
  }

  return updatedUser;
}

