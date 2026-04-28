"use server";

import { db } from "@/lib/prisma";

export async function getRouteUrl(name: string, fallbackUrl: string) {
  try {
    const route = await db.apiRoute.findUnique({ where: { name } });
    if (route && route.isActive) {
      return route.url;
    }
  } catch (error) {
    console.error(`Error looking up route ${name}:`, error);
  }
  return fallbackUrl;
}

function getApiUrl() {
  return process.env.GUIDE_API_URL || "https://local-urbano.onrender.com";
}

export async function getGuides() {
  try {
    const guides = await db.guideProfile.findMany({
      where: {
        status: "APPROVED"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        packages: {
          where: { status: "PUBLISHED" }
        },
        subscriptions: {
          include: {
            plan: true
          },
          where: {
            status: "active"
          },
          take: 1
        }
      }
    });

    const guidesWithPlan = guides.map(g => ({
      ...g,
      plan: g.subscriptions[0]?.plan?.name?.toLowerCase() || 'free'
    }));

    const planOrder: Record<string, number> = { 'ultimate': 3, 'pro': 2, 'free': 1 };
    
    return guidesWithPlan.sort((a, b) => {
      const planA = planOrder[a.plan] || 0;
      const planB = planOrder[b.plan] || 0;
      if (planA !== planB) return planB - planA;
      return ((b as any).rating || 0) - ((a as any).rating || 0);
    });
  } catch (error) {
    console.error("Error fetching guides:", error);
    return [];
  }
}

export async function getFeaturedGuides() {
  let localGuides: any[] = [];
  try {
    localGuides = await db.guideProfile.findMany({
      where: {
        AND: [
          { status: "APPROVED" },
          { 
            subscriptions: {
              some: {
                status: "active",
                plan: {
                  name: {
                    in: ["PRO", "ULTIMATE", "pro", "ultimate"]
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        subscriptions: {
          include: { plan: true },
          where: { status: "active" },
          take: 1
        }
      }
    });

    localGuides = localGuides.map(g => ({
      ...g,
      plan: g.subscriptions[0]?.plan?.name?.toLowerCase() || 'free'
    }));
  } catch (err) {
    console.error("Local guides fallback error:", err);
  }

  try {
    const baseFallback = `${getApiUrl()}/api/public/guides/featured`;
    const url = await getRouteUrl("GUIDES_API", baseFallback);
    const res = await fetch(url, { cache: "no-store" });
    
    let externalGuides: any[] = [];
    if (res.ok) {
      externalGuides = await res.json();
    }
    
    const merged = [...localGuides, ...externalGuides];
    const planOrder: Record<string, number> = { 'ultimate': 3, 'pro': 2, 'free': 1 };
    
    return merged.sort((a, b) => {
      const planA = planOrder[a.plan || 'free'] || 0;
      const planB = planOrder[b.plan || 'free'] || 0;
      return planB - planA;
    });
  } catch (error) {
    console.error("Error fetching featured guides:", error);
    return localGuides;
  }
}

export async function getPublicPackage(id: string) {
  try {
    const baseFallback = `${getApiUrl()}/api/public/packages/{id}`;
    let url = await getRouteUrl("DETALHES_PACOTE_ESPECIFICADO_API", baseFallback);
    if (url.includes("{id}")) {
      url = url.replace("{id}", id);
    } else if (url.includes("[id]")) {
      url = url.replace("[id]", id);
    } else {
      url = url.endsWith("/") ? url + id : url + "/" + id;
    }
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return await db.tourPackage.findUnique({
        where: { id },
        include: {
          guide: {
            include: { user: { select: { id: true, name: true, avatar: true } } }
          }
        }
      });
    }
    const data = await res.json();
    if (data && typeof data === 'object') {
      if (data.package) return data.package;
      if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) return data.data;
    }
    return data;
  } catch (error) {
    console.error("Error fetching package:", error);
    try {
      return await db.tourPackage.findUnique({
        where: { id },
        include: {
          guide: {
            include: { user: { select: { id: true, name: true, avatar: true } } }
          }
        }
      });
    } catch {
      return null;
    }
  }
}

export async function getPublicPackages() {
  let localPackages: any[] = [];
  try {
    localPackages = await db.tourPackage.findMany({
      where: { status: "PUBLISHED" },
      include: {
        guide: {
          include: { user: { select: { id: true, name: true, avatar: true } } }
        },
        routes: {
          include: {
            places: {
              include: { place: true }
            }
          }
        }
      }
    });
  } catch (err) {
    console.error("Local DB query failed:", err);
  }

  try {
    const baseFallback = `${getApiUrl()}/api/public/packages?limit=50`;
    const url = await getRouteUrl("PACOTES_GERAIS_API", baseFallback);
    const res = await fetch(url, { cache: "no-store" });
    
    let externalPackages: any[] = [];
    if (res.ok) {
      const data = await res.json();
      if (data && !Array.isArray(data)) {
          if (Array.isArray(data.packages)) externalPackages = data.packages;
          else if (Array.isArray(data.data)) externalPackages = data.data;
          else if (Array.isArray(data.items)) externalPackages = data.items;
      } else {
          externalPackages = Array.isArray(data) ? data : [];
      }
    }

    const merged = [...localPackages, ...externalPackages];
    const planOrder: Record<string, number> = { 'ultimate': 3, 'pro': 2, 'free': 1 };

    merged.sort((a, b) => {
        // 1. Boosted Priority
        const aBoosted = (a as any).isBoosted || false;
        const bBoosted = (b as any).isBoosted || false;
        if (aBoosted && !bBoosted) return -1;
        if (!aBoosted && bBoosted) return 1;

        // 2. Plan Priority
        const planA = planOrder[a.guide?.plan || 'free'] || 0;
        const planB = planOrder[b.guide?.plan || 'free'] || 0;
        if (planA !== planB) return planB - planA;
        
        return 0;
    });

    return merged;
  } catch (error) {
    console.error("Error fetching packages:", error);
    return localPackages;
  }
}

export async function getPremiumPackages() {
  try {
    const pkgs = await getPublicPackages();
    // Prioritize boosted packages for the "Premium" category
    return pkgs.filter((p: any) => p.isBoosted || p.guide?.plan === 'ultimate').slice(0, 10);
  } catch (error) {
    console.error("Error fetching premium packages:", error);
    return [];
  }
}

export async function getGuide(id: string) {
  try {
    const guide = await db.guideProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        packages: {
          where: { status: "PUBLISHED" }
        },
        subscriptions: {
          include: {
            plan: true
          },
          where: {
            status: "active"
          },
          take: 1
        }
      }
    });

    let gu: any = guide;

    // If guide wasn't found by its own ID, maybe the ID passed is the user ID?
    if (!gu) {
       gu = await db.guideProfile.findFirst({
         where: { userId: id },
         include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          packages: {
            where: { status: "PUBLISHED" }
          },
          subscriptions: {
            include: {
              plan: true
            },
            where: {
              status: "active"
            },
            take: 1
          }
        }
       });
    }

    if (gu) {
      return {
        ...gu,
        plan: gu.subscriptions[0]?.plan?.name?.toLowerCase() || 'free'
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching guide:", error);
    return null;
  }
}

export async function getCity(id: string) {
  try {
    const city = await db.city.findUnique({
      where: { id }
    });
    return city;
  } catch (error) {
    console.error("Error fetching city:", error);
    return null;
  }
}

export async function getFeaturedCities() {
  try {
    return await db.city.findMany({
      where: { featured: true },
      take: 10
    });
  } catch (error) {
    console.error("Error fetching featured cities:", error);
    return [];
  }
}

