// app/layout.tsx

import type { Metadata } from "next";
// A LINHA DO Inter FOI REMOVIDA
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// A CONSTANTE "inter" FOI REMOVIDA

export const metadata: Metadata = {
  title: "Gestor de Projetos",
  description: "Crie e gerencie os custos dos seus projetos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // A CLASSE DO "inter" FOI REMOVIDA DO <html> E DO <body>
    <html lang="pt-BR">
      <head>
        {/* IMPORTAÇÃO DE FONTES À MODA ANTIGA */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}