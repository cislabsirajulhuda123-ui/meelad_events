import type { Metadata } from "next";
import { loadFestival } from "@/lib/festival";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await loadFestival();
    return {
      title: data.content["browser-title"] || data.settings.name,
      description: "Festival events, results and championship standings.",
      icons: { icon: "/meelad-logo.png" },
    };
  } catch {
    return {
      title: "MEELAD KUNDUTHODE",
      description: "Festival events, results and championship standings.",
      icons: { icon: "/meelad-logo.png" },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/fonts.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
