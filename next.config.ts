import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/espoir-stats" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/espoir-stats/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
