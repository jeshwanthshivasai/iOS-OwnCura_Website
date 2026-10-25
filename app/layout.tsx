import type { Metadata } from "next";
import { fontClassName } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "OwnCura — The ownership infrastructure for American healthcare practices",
  description: "OwnCura owns and operates medical practices across the United States. Keep yours, grow it, bring in a partner, or hand it over. See what it is worth, free.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontClassName}>
      <body>{children}</body>
    </html>
  );
}
