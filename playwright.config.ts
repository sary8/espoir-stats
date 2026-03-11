import fs from "fs";
import path from "path";
import { defineConfig } from "@playwright/test";

function loadLocalEnv(): Record<string, string> {
  const filePath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(filePath)) return {};

  return Object.fromEntries(
    fs.readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const idx = line.indexOf("=");
        if (idx === -1) return [line, ""];
        return [line.slice(0, idx), line.slice(idx + 1)];
      })
  );
}

const localEnv = loadLocalEnv();
process.env = { ...localEnv, ...process.env };

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        storageState: "e2e/.auth/user.json",
      },
      testIgnore: /auth\.spec\.ts/,
      dependencies: ["setup"],
    },
    {
      name: "auth-tests",
      testMatch: /auth\.spec\.ts/,
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
