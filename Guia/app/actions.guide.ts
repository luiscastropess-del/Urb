"use server";

import { db } from "@/lib/prisma";
import { getUserSession } from "@/app/actions.auth";
import { sendNotification } from "@/actions.notifications";

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
          status: user.role === "admin" ? "APPROVED" : "PENDING",
        },
      });
    }

    return { profile, user };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getDashboardData() {
  const user = await getUserSession();
  if (!user || (user.role !== "guide" && user.role !== "admin")) return { error: "Sem permissão" };

  let profile = await db.guideProfile.findUnique({
    where: { userId: user.id },
    include: {
      subscriptions: {
        include: {
          plan: true
        }
      }
    }
  });
  
  if (!profile) {
    return { profile: null, user };
  }

  if (profile.status === "PENDING") {
    return { profile, user };
  }

  // Fetch stats and data for the guide
  // ... rest remains same ...
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Reservations
  const reservations = await db.reservation.findMany({
    where: {
      package: { guideId: profile.id }
    },
    include: {
      customer: true,
      package: true,
    },
    orderBy: { createdAt: "desc" }
  });

  const novosClientes = reservations.filter(r => r.createdAt >= startOfMonth).length;
  const vendasPacotes = reservations.length;
  
  // Fake or mock for Km Rodados and Locais Visitados if not available in DB
  const kmRodados = 1250;
  const locaisVisitados = 45;

  const receitaMensal = reservations
    .filter(r => r.createdAt >= startOfMonth && r.status !== "CANCELLED")
    .reduce((sum, r) => sum + r.totalPrice, 0);

  // Vendas ultimos 7 dias (array of 7 values)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0,0,0,0);
    return d;
  });

  const vendasList = last7Days.map(date => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const daySales = reservations.filter(r => r.createdAt >= date && r.createdAt < nextDay && r.status !== "CANCELLED");
    return {
      date: date.toLocaleDateString("pt-BR", { weekday: 'short' }),
      count: daySales.length,
      amount: daySales.reduce((s, r) => s + r.totalPrice, 0)
    };
  });

  // Clientes recentes
  const clientesRecentes = reservations.slice(0, 4).map(r => ({
    nome: r.customer.name,
    pacote: r.package.title,
    valor: r.totalPrice,
    data: r.createdAt.toLocaleDateString("pt-BR")
  }));

  // Get packages belonging to the guide to list even if 0 sales
  const myPackages = await db.tourPackage.findMany({
    where: { guideId: profile.id }
  });

  const pacotesMapa = myPackages.reduce((acc, p) => {
    acc[p.id] = { nome: p.title, vendas: 0, receita: 0, cor: "bg-orange-500" };
    return acc;
  }, {} as Record<string, any>);

  reservations.forEach(r => {
    if (r.status !== "CANCELLED" && pacotesMapa[r.packageId]) {
      pacotesMapa[r.packageId].vendas += 1;
      pacotesMapa[r.packageId].receita += r.totalPrice;
    }
  });

  const colors = ["bg-orange-500", "bg-green-500", "bg-amber-500", "bg-rose-500", "bg-blue-500"];
  const pacotesVendidos = Object.values(pacotesMapa)
    .sort((a: any, b: any) => b.receita - a.receita)
    .map((p: any, index) => {
      p.cor = colors[index % colors.length];
      return p;
    })
    .slice(0, 4);

  // Get real places from database instead of fake
  const places = await db.place.findMany({
    where: { rating: { not: null } },
    orderBy: { userRatingsTotal: "desc" },
    take: 5
  });

  const locaisPopulares = places.map(p => ({
    nome: p.name,
    visitas: p.userRatingsTotal || 0,
    avaliacao: p.rating || 0
  }));

  // Get recent activities for the user
  const recentActivities = await db.activity.findMany({
    where: { userId: user.id },
    include: { place: true },
    orderBy: { createdAt: "desc" },
    take: 6
  });

  return {
    stats: {
      novosClientes,
      vendasPacotes,
      kmRodados,
      locaisVisitados,
      receitaMensal
    },
    vendasList,
    clientesRecentes,
    pacotesVendidos,
    locaisPopulares,
    recentActivities,
    profile, 
    user
  };
}

export async function getGuideProfileData() {
  const user = await getUserSession();
  if (!user || (user.role !== "guide" && user.role !== "admin")) return { error: "Sem permissão" };

  try {
    const profile = await db.guideProfile.findUnique({
      where: { userId: user.id },
      include: {
        subscriptions: {
          include: {
            plan: true
          }
        },
        packages: {
          take: 3,
          orderBy: { createdAt: "desc" }
        },
        routes: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: { places: true }
        }
      }
    });

    const reviews = await db.tourReview.findMany({
      where: { package: { guideId: profile?.id } },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { customer: true }
    });

    return { profile, reviews };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function activateSubscriptionLocal(planId: string) {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  const profile = await db.guideProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) throw new Error("Perfil de guia não encontrado");

  // Create or update subscription
  const sub = await db.subscription.upsert({
    where: { guideId: profile.id },
    update: {
      planId,
      status: "active",
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      paymentStatus: "paid",
    },
    create: {
      guideId: profile.id,
      planId,
      status: "active",
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      paymentStatus: "paid",
    }
  });

  return sub;
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
        bio: data.bio,
        pixKey: data.pixKey,
        languages: data.languages,
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

  await sendNotification(`📢 Novo Guia ${user.name} solicitou registro ou atualizou perfil!`);

  return profile;
}

export async function updateGuideCustomization(data: { customColors?: string; customFont?: string; customDomain?: string; customSettings?: string }) {
  const user = await getUserSession();
  if (!user) throw new Error("Não autenticado");

  const existing = await db.guideProfile.findUnique({
    where: { userId: user.id },
  });

  if (!existing) throw new Error("Perfil de guia não encontrado");

  return await db.guideProfile.update({
    where: { userId: user.id },
    data: {
      customColors: data.customColors,
      customFont: data.customFont,
      customDomain: data.customDomain,
      customSettings: data.customSettings,
    },
  });
}
