import { test, expect } from "@playwright/test";

test.describe("認証フロー", () => {
  const sitePassword = process.env.SITE_PASSWORD;

  test("未認証ユーザーはログインページにリダイレクトされる", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("間違ったパスワードでエラーが表示される", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#password", "wrong-password");
    await page.click('button[type="submit"]');
    await expect(page.locator('#auth-error')).toBeVisible();
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

  test("正しいパスワードでログインできる", async ({ page, context }) => {
    test.skip(!sitePassword, "SITE_PASSWORD が必要");

    await page.goto("/login");
    await page.fill("#password", sitePassword!);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("h1")).toContainText("ESPOIR");

    const cookies = await context.cookies();
    expect(cookies.some((cookie) => cookie.name === "espoir-auth")).toBe(true);
  });
});
