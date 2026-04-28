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
        role: "user"
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

    await createSession(user);

    return { success: true };
  } catch (error: any) {
    console.error("Login Error:", error);
    return { success: false, error: "Ocorreu um erro ao fazer login" };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  // No logout, definimos como expirado usando os mesmos atributos
  cookieStore.set("auth_token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
    maxAge: 0,
    path: "/",
  });
  revalidatePath("/");
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

export async function updateUserProfile(userId: string, data: { name?: string; avatar?: string; email?: string; bio?: string; languages?: string[]; pixKey?: string }) {
  try {
    const session = await getUserSession();
    if (!session || session.id !== userId) {
      return { success: false, error: "Não autorizado" };
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.avatar) updateData.avatar = data.avatar;
    if (data.email) {
      if (data.email !== session.email) {
        const existing = await db.user.findUnique({ where: { email: data.email } });
        if (existing) {
          return { success: false, error: "Este e-mail já está em uso por outro usuário" };
        }
        updateData.email = data.email;
      }
    }

    // Update User
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData
    });

    // Update Guide Profile if exists and data provided
    if (session.role === "guide") {
      const guideProfile = await db.guideProfile.findUnique({ where: { userId } });
      if (guideProfile) {
        const guideData: any = {};
        if (data.bio !== undefined) guideData.bio = data.bio;
        if (data.languages !== undefined) guideData.languages = data.languages;
        if (data.pixKey !== undefined) guideData.pixKey = data.pixKey;

        if (Object.keys(guideData).length > 0) {
          await db.guideProfile.update({
            where: { userId },
            data: guideData
          });
        }
      } else if (session.role === "guide") {
        // If they are a guide but have no profile for some reason, create it
         await db.guideProfile.create({
           data: {
             userId,
             bio: data.bio || "",
             languages: data.languages || ["Português"],
             pixKey: data.pixKey || ""
           }
         });
      }
    }

    revalidatePath("/profile");
    
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return { success: false, error: "Ocorreu um erro ao atualizar o perfil" };
  }
}

export async function getGuideProfile(userId: string) {
  try {
    return await db.guideProfile.findUnique({
      where: { userId }
    });
  } catch (error) {
    console.error("Error fetching guide profile:", error);
    return null;
  }
}

