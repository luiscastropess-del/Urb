import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urbano Holambra",
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
          {children}
        </div>
      </body>
    </html>
  );
}
