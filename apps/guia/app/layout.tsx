import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { SupabaseNotifications } from "@/components/SupabaseNotifications";

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
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-slate-100 text-slate-800" suppressHydrationWarning>
        <ToastProvider>
          <SupabaseNotifications />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
