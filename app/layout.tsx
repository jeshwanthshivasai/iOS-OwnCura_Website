import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { fontClassName } from "./fonts";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "OwnCura — The ownership infrastructure for American healthcare practices",
  description: "OwnCura owns and operates medical practices across the United States. Keep yours, grow it, bring in a partner, or hand it over. See what it is worth, free.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassName} suppressHydrationWarning>
      <head>
        {/* the intro and the reveals hide words only once JavaScript runs: this flag is set before the first paint */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
      </head>
      <body>
        {children}
        {/* Vercel Web Analytics: page views, without cookies (asked for 26 Oct 2026) */}
        <Analytics />
      </body>
    </html>
  );
}
