
import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import BootSplash from "@/components/forum/boot-splash";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const communityBanners = [
  "/bgmi-community-banner.webp",
  "/valorant-community-banner.webp",
  "/chess-community-banner.webp",
  "/free-fire-community-banner.webp",
  "/offtopic-community-banner.webp",
  "/esports-community-banner.webp",
];

export const metadata: Metadata = {
  title: "Snyt",
  description:
    "Discussions for esports, gaming and everything in between. Built by SNYT Esports.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {communityBanners.map((banner) => (
          <link
            key={banner}
            rel="preload"
            as="image"
            href={banner}
            fetchPriority="low"
          />
        ))}
      </head>
      <body className="min-h-full flex flex-col">
        <BootSplash />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
