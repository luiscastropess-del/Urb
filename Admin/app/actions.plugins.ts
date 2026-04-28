"use server";

import { db } from "@/lib/prisma";

export async function getPlugins() {
  return await db.plugin.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getActivePlugins() {
  return await db.plugin.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPluginBySlug(slug: string) {
  return await db.plugin.findUnique({
    where: { slug },
  });
}

export async function upsertPlugin(data: {
  name: string;
  slug: string;
  description?: string;
  version?: string;
  author?: string;
  isActive?: boolean;
  manifest?: string;
  codeHtml?: string;
}) {
  return await db.plugin.upsert({
    where: { slug: data.slug },
    update: data,
    create: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      version: data.version || "1.0.0",
      author: data.author,
      isActive: data.isActive || false,
      manifest: data.manifest,
      codeHtml: data.codeHtml,
    },
  });
}

export async function deletePlugin(id: string) {
  return await db.plugin.delete({
    where: { id },
  });
}

export async function togglePluginStatus(id: string, isActive: boolean) {
  return await db.plugin.update({
    where: { id },
    data: { isActive },
  });
}
