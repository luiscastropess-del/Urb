"use client";

import { useEffect, useState } from "react";
import { getPlugins } from "@/app/actions.plugins";
import { WeatherModule, AIAssistantModule } from "./BasicModules";

interface ModuleLoaderProps {
  slug: string;
}

export default function ModuleLoader({ slug }: ModuleLoaderProps) {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const plugins = await getPlugins();
        const plugin = plugins.find(p => p.slug === slug);
        setIsActive(!!plugin?.isActive);
      } catch (error) {
        console.error("Module Check Error:", error);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [slug]);

  if (loading || !isActive) return null;

  // Registry of slug-to-component
  switch (slug) {
    case "weather-widget":
      return <WeatherModule />;
    case "ai-assistant":
      return <AIAssistantModule />;
    default:
      return null;
  }
}
