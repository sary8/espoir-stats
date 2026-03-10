import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("ページ表示", () => {
  test("存在しないページはログインにリダイレクトされる", async ({ page }) => {
    await page.goto("/nonexistent-page");
    // 未認証のため、404でもログインページにリダイレクトされる
    await expect(page).toHaveURL(/\/login/);
  });
});
