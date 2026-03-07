import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/players/**",
        search: "",
      },
      {
        pathname: "/api/players/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
