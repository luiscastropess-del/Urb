import { db } from "./prisma";

export async function getApiRouteUrl(name: string, fallbackUrl: string): Promise<string> {
  try {
    const apiRoute = await db.apiRoute.findUnique({
      where: { name }
    });

    if (apiRoute?.isActive && apiRoute.url) {
      return apiRoute.url;
    }
  } catch (e) {
    console.error("Error fetching API route from database:", e);
  }

  // Fallback to default provided UI if not configured in the DB
  return fallbackUrl;
}
