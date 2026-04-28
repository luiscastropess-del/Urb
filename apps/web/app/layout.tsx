import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Urbano",
  description: "Seu guia completo para Holambra",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className="antialiased bg-slate-100 dark:bg-slate-950 h-[100dvh] overflow-hidden flex justify-center text-slate-800 dark:text-slate-200"
        suppressHydrationWarning
      >
        <div className="w-full max-w-md h-full relative flex flex-col bg-slate-50 dark:bg-slate-900 shadow-2xl overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-16">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
