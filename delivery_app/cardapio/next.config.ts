import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Ativa o modo estrito do React
  output: "standalone", // Permite que o Next.js seja executado como um aplicativo independente
};

export default nextConfig;