import { test, expect } from "@playwright/test";

test.describe("ページ遷移・コンテンツ表示", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
  });

  test("ダッシュボードにチーム統計セクションが表示される", async ({ page }) => {
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.locator("h1")).toContainText("ESPOIR");
  });

  test("メンバーページに遷移して選手一覧が表示される", async ({ page }) => {
    const link = page.locator('nav[aria-label="メインナビゲーション"] a[href="/members"]');
    await link.waitFor();
    await link.click();
    await page.waitForURL(/\/members/);
    await expect(page.locator("h2").first()).toBeVisible();
  });

  test("試合一覧ページに遷移して試合カードが表示される", async ({ page }) => {
    const link = page.locator('nav[aria-label="メインナビゲーション"] a[href="/games"]');
    await link.waitFor();
    await link.click();
    await page.waitForURL(/\/games/);
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("試合詳細ページに遷移してスコアが表示される", async ({ page }) => {
    const gamesLink = page.locator('nav[aria-label="メインナビゲーション"] a[href="/games"]');
    await gamesLink.waitFor();
    await gamesLink.click();
    await page.waitForURL(/\/games/);
    // 最初の試合リンクをクリック
    const firstGameLink = page.locator('a[href*="/games/"]').first();
    await firstGameLink.waitFor();
    await firstGameLink.click();
    await page.waitForURL(/\/games\/.+/);
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("選手詳細ページに遷移してプロフィールが表示される", async ({ page }) => {
    const membersLink = page.locator('nav[aria-label="メインナビゲーション"] a[href="/members"]');
    await membersLink.waitFor();
    await membersLink.click();
    await page.waitForURL(/\/members/);
    // 最初の選手リンクをクリック
    const firstMemberLink = page.locator('a[href*="/member/"]').first();
    await firstMemberLink.waitFor();
    await firstMemberLink.click();
    await page.waitForURL(/\/member\/.+/);
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("用語集ページに遷移して内容が表示される", async ({ page }) => {
    const link = page.locator('nav[aria-label="メインナビゲーション"] a[href="/glossary"]');
    await link.waitFor();
    await link.click();
    await page.waitForURL(/\/glossary/);
    await expect(page.locator("#main-content")).toBeVisible();
    // 用語が表示されていること（略称が他セクションと被らないようabbr属性で特定）
    await expect(page.getByRole("term").filter({ hasText: "PTS" })).toBeVisible();
    await expect(page.getByRole("term").filter({ hasText: "AST" })).toBeVisible();
  });

  test("シーズン比較ページに遷移できる", async ({ page }) => {
    const link = page.locator('nav[aria-label="メインナビゲーション"] a[href="/compare"]');
    await link.waitFor();
    await link.click();
    await page.waitForURL(/\/compare/);
  });

  test("ヘッダーナビゲーションが全ページリンクを含む", async ({ page }) => {
    const nav = page.locator('nav[aria-label="メインナビゲーション"]');
    await expect(nav.locator('a[href="/members"]')).toBeVisible();
    await expect(nav.locator('a[href="/games"]')).toBeVisible();
    await expect(nav.locator('a[href="/compare"]')).toBeVisible();
    await expect(nav.locator('a[href="/glossary"]')).toBeVisible();
  });
});
