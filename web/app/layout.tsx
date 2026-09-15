import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "morph | Teacher Dashboard",
  description: "Pedagogical compiler and teacher dashboard for the Morph MVP."
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
