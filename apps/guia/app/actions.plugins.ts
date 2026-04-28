"use server";

import { db } from "@urb/shared";
import { getUserSession } from "./actions.auth";
import { revalidatePath } from "next/cache";

export async function getPlugins() {
  try {
    return await db.plugin.findMany({
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("Error fetching plugins:", error);
    return [];
  }
}

export async function togglePlugin(slug: string, isActive: boolean) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "guide")) {
    throw new Error("Não autorizado");
  }

  try {
    const plugin = await db.plugin.update({
      where: { slug },
      data: { isActive }
    });
    
    revalidatePath("/dashboard/guia/plugins");
    return { success: true, plugin };
  } catch (error) {
    console.error("Error toggling plugin:", error);
    return { error: "Falha ao atualizar plugin" };
  }
}

export async function updatePluginSettings(slug: string, settings: string) {
  const session = await getUserSession();
  if (!session || (session.role !== "admin" && session.role !== "guide")) {
    throw new Error("Não autorizado");
  }

  try {
    const plugin = await db.plugin.update({
      where: { slug },
      data: { settings }
    });
    
    revalidatePath(`/dashboard/guia/plugins/${slug}`);
    return { success: true, plugin };
  } catch (error) {
    console.error("Error updating plugin settings:", error);
    return { error: "Falha ao atualizar configurações" };
  }
}

export async function getAiAssistantConfig() {
  try {
    const plugin = await db.plugin.findUnique({
      where: { slug: "ai-assistant" }
    });

    const keyRecord = await db.apiKey.findUnique({
      where: { provider: "NEXT_PUBLIC_GEMINI_API_KEY" }
    });

    let model = "gemini-3-flash-preview"; // default
    let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    let tone = "profissional"; // default

    if (plugin && plugin.settings) {
      try {
        const settings = JSON.parse(plugin.settings);
        if (settings.model) {
          model = settings.model;
          // Map prohibited/old models to valid ones for the newer SDK
          if (model === "gemini-1.5-flash" || model === "gemini-flash") model = "gemini-3-flash-preview";
          if (model === "gemini-1.5-pro" || model === "gemini-pro") model = "gemini-3.1-pro-preview";
        }
        if (settings.tone) tone = settings.tone;
      } catch (e) {
        console.error("Error parsing plugin settings:", e);
      }
    }

    if (keyRecord && keyRecord.isActive && keyRecord.key) {
      apiKey = keyRecord.key;
    }

    return { model, apiKey, tone };
  } catch (error) {
    console.error("Error fetching AI Assistant config:", error);
    return { 
      model: "gemini-3-flash-preview", 
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
      tone: "profissional"
    };
  }
}

export async function getGeminiApiKey() {
  try {
    const keyRecord = await db.apiKey.findUnique({
      where: { provider: "NEXT_PUBLIC_GEMINI_API_KEY" }
    });
    
    if (keyRecord && keyRecord.isActive) {
      return keyRecord.key;
    }
    
    // If not found in DB or inactive, fallback to env
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
  } catch (error) {
    console.error("Error fetching Gemini API Key from DB:", error);
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
  }
}

export async function getPluginBySlug(slug: string) {
  try {
    return await db.plugin.findUnique({
      where: { slug }
    });
  } catch (error) {
    console.error("Error fetching plugin:", error);
    return null;
  }
}

export async function seedPlugins() {
  const plugins = [
    {
      name: "Assisente de IA",
      slug: "ai-assistant",
      description: "Integração inteligente para gerar descrições de pacotes e apresentações de roteiros personalizadas.",
      version: "1.3.0",
      author: "Holambra Tech",
      manifest: JSON.stringify({ icon: "Sparkles", color: "purple" }),
      isActive: true
    },
    {
      name: "Previsão do Tempo",
      slug: "weather-widget",
      description: "Mostra a previsão do tempo em tempo real para os turistas.",
      version: "1.0.5",
      author: "Meteo Holambra",
      manifest: JSON.stringify({ icon: "CloudSun", color: "blue" }),
      isActive: false
    },
    {
      name: "Conversor de Moedas",
      slug: "currency-converter",
      description: "Ferramenta para turistas estrangeiros converterem Euro/Dólar para Real.",
      version: "1.0.0",
      author: "Finance App",
      manifest: JSON.stringify({ icon: "DollarSign", color: "green" }),
      isActive: false
    },
    {
      name: "Chat em Tempo Real",
      slug: "realtime-chat",
      description: "Comunicação direta entre guias e turistas dentro da plataforma.",
      version: "2.1.0",
      author: "FastChat",
      manifest: JSON.stringify({ icon: "MessageSquare", color: "orange" }),
      isActive: true
    },
    {
      name: "Analíticos de Mapa",
      slug: "map-analytics",
      description: "Visualização de onde os turistas estão mais interessados no mapa.",
      version: "0.9.0",
      author: "GeoVisual",
      manifest: JSON.stringify({ icon: "Map", color: "indigo" }),
      isActive: false
    },
    {
      name: "PagDev (Modo Pagamento Desenvolvedor)",
      slug: "pagdev-gateway",
      description: "Gateway de pagamento em modo de desenvolvimento. Simula pagamentos com sucesso para testes sem integrar provedores reais.",
      version: "1.0.0",
      author: "Holambra Tech",
      manifest: JSON.stringify({ icon: "CreditCard", color: "rose" }),
      isActive: false
    }
  ];

  for (const p of plugins) {
    await db.plugin.upsert({
      where: { slug: p.slug },
      update: {},
      create: p
    });
  }
}
