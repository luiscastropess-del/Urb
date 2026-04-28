import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "City Ventures",
  description: "Seu guia completo de passeios e eventos divertidos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className="antialiased bg-slate-50 dark:bg-slate-950 h-[100dvh] overflow-hidden flex flex-col text-slate-800 dark:text-slate-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
