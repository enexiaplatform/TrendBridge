import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: { cpus: 2, optimizePackageImports: ["lucide-react", "recharts"] },
};

export default nextConfig;
