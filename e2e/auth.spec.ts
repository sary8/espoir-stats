import { test, expect } from "@playwright/test";

test.describe("認証フロー", () => {
  test("未認証ユーザーはログインページにリダイレクトされる", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("間違ったパスワードでエラーが表示される", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#password", "wrong-password");
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("ログインページが正しく表示される", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Espoir Stats");
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("パスワード未入力ではボタンが無効", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });
});
