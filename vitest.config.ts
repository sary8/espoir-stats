import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => ({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    env: loadEnv(mode, process.cwd(), ""),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
