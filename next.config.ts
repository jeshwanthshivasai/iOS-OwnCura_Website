import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the repository root is the workspace: Turbopack must not pick a lockfile further up the disk
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
