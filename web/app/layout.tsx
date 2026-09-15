import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "morph | Aulas que transformam",
  description: "A Morph transforma a intenção pedagógica numa experiência executável no smartphone."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
