import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["@mimelux/ui", "@mimelux/core"],
};

export default nextConfig;
