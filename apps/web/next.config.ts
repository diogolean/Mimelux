import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mimelux/ui", "@mimelux/core"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
