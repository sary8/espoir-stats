import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const sitePassword = process.env.SITE_PASSWORD;
  setup.skip(!sitePassword, "SITE_PASSWORD が必要");

  await page.goto("/login");
  await page.fill("#password", sitePassword!);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/$/);

  await page.context().storageState({ path: authFile });
});
