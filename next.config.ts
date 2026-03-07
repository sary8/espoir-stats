import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/players/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
