import { notFound } from "next/navigation";
import { getPluginBySlug } from "@/app/actions.plugins";
import { Box } from "lucide-react";
import Link from "next/link";

export default async function RunPluginPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const plugin = await getPluginBySlug(resolvedParams.slug);

  if (!plugin || !plugin.isActive) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800">
      <header className="px-5 md:px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center">
             <Box size={16} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{plugin.name}</h1>
          </div>
        </div>
        <Link href="/admin/plugins" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
           Voltar para Plugins
        </Link>
      </header>
      
      <div className="flex-1 w-full bg-white dark:bg-slate-950">
        {plugin.codeHtml ? (
          <iframe 
            srcDoc={plugin.codeHtml} 
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title={plugin.name}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <p>Este plugin não possui interface visual registrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
