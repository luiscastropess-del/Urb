import { db } from "./prisma";

export async function getProviderKey(provider: string): Promise<string | undefined> {
  const apiKey = await db.apiKey.findUnique({
    where: { provider }
  });

  if (apiKey?.isActive) {
    return apiKey.key;
  }

  // Fallback to environment variables if not found in the DB
  return process.env[provider];
}
