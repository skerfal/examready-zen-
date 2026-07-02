import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IqraaNow 5.0 · Comprends la leçon, maîtrise l'examen",
  description:
    "IqraaNow — la plateforme éducative multi-écoles pour les apprenants ambitieux. National, International et Élite. Comprends la leçon, maîtrise l'examen.",
};

export const viewport: Viewport = {
  themeColor: "#14181f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${inter.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
