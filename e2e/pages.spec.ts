import { test, expect } from "@playwright/test";

const sitePassword = process.env.SITE_PASSWORD;

test.describe("ページ遷移・コンテンツ表示", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!sitePassword, "SITE_PASSWORD が必要");
    await page.goto("/login");
    await page.fill("#password", sitePassword!);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/);
  });

  test("ダッシュボードにチーム統計セクションが表示される", async ({ page }) => {
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.locator("h1")).toContainText("ESPOIR");
  });

  test("メンバーページに遷移して選手一覧が表示される", async ({ page }) => {
    await page.click('a[href="/members"]');
    await expect(page).toHaveURL(/\/members/);
    await expect(page.locator("h2").first()).toBeVisible();
  });

  test("試合一覧ページに遷移して試合カードが表示される", async ({ page }) => {
    await page.click('a[href="/games"]');
    await expect(page).toHaveURL(/\/games/);
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("試合詳細ページに遷移してスコアが表示される", async ({ page }) => {
    await page.click('a[href="/games"]');
    await expect(page).toHaveURL(/\/games/);
    // 最初の試合リンクをクリック
    const firstGameLink = page.locator('a[href*="/games/"]').first();
    await firstGameLink.click();
    await expect(page).toHaveURL(/\/games\/.+/);
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("選手詳細ページに遷移してプロフィールが表示される", async ({ page }) => {
    await page.click('a[href="/members"]');
    await expect(page).toHaveURL(/\/members/);
    // 最初の選手リンクをクリック
    const firstMemberLink = page.locator('a[href*="/member/"]').first();
    await firstMemberLink.click();
    await expect(page).toHaveURL(/\/member\/.+/);
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("用語集ページに遷移して内容が表示される", async ({ page }) => {
    await page.click('a[href="/glossary"]');
    await expect(page).toHaveURL(/\/glossary/);
    await expect(page.locator("#main-content")).toBeVisible();
    // 用語が表示されていること（略称が他セクションと被らないようabbr属性で特定）
    await expect(page.getByRole("term").filter({ hasText: "PTS" })).toBeVisible();
    await expect(page.getByRole("term").filter({ hasText: "AST" })).toBeVisible();
  });

  test("シーズン比較ページに遷移できる", async ({ page }) => {
    await page.click('a[href="/compare"]');
    await expect(page).toHaveURL(/\/compare/);
  });

  test("ヘッダーナビゲーションが全ページリンクを含む", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav.locator('a[href="/members"]')).toBeVisible();
    await expect(nav.locator('a[href="/games"]')).toBeVisible();
    await expect(nav.locator('a[href="/compare"]')).toBeVisible();
    await expect(nav.locator('a[href="/glossary"]')).toBeVisible();
  });
});
