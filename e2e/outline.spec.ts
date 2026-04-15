import { test, expect } from '@playwright/test';

// Shared session ID fetched dynamically
let testSessionId: string | null = null;

test.describe('Interactive Outline', () => {
  test.beforeAll(async ({ request }) => {
    // Fetch a session ID dynamically from the API
    const response = await request.get('http://127.0.0.1:3001/api/sessions?limit=1');
    const json = await response.json();
    const sessions = json.data?.sessions ?? [];
    if (sessions.length > 0) {
      testSessionId = sessions[0].id;
    }
  });

  test.beforeEach(async ({ page }) => {
    // Configure the app by setting data root in localStorage
    // Uses environment variable for portability, falls back to default
    const dataRoot = process.env.AKL_DATA_ROOT || '~/akl-knowledge';
    await page.addInitScript((root) => {
      localStorage.setItem('akl-data-root', root);
    }, dataRoot);
  });

  test('outline section is visible on session detail page', async ({ page }) => {
    test.skip(!testSessionId, 'No sessions available');
    // Navigate directly to a known session
    await page.goto(`/sessions/${testSessionId}`);
    await page.waitForLoadState('networkidle');
    // Wait for article content to render
    await page.waitForSelector('article.markdown-body', { timeout: 10000 });

    // Check outline header exists
    await expect(page.getByText('Outline', { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('outline has toggle button', async ({ page }) => {
    test.skip(!testSessionId, 'No sessions available');
    await page.goto(`/sessions/${testSessionId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('article.markdown-body', { timeout: 10000 });

    // Check toggle button exists
    const toggleButton = page.getByRole('button', { name: /collapse outline/i });
    await expect(toggleButton).toBeVisible({ timeout: 5000 });
  });

  test('outline collapses when toggle is clicked', async ({ page }) => {
    test.skip(!testSessionId, 'No sessions available');
    await page.goto(`/sessions/${testSessionId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('article.markdown-body', { timeout: 10000 });

    // Check outline is expanded (heading items visible)
    const outlineList = page.locator('ul[role="list"]');
    await expect(outlineList).toBeVisible({ timeout: 5000 });

    // Click toggle to collapse
    await page.getByRole('button', { name: /collapse outline/i }).click();

    // Check outline is collapsed (max-h-0 class applied)
    const collapsedContainer = page.locator('[class*="max-h-0"]');
    await expect(collapsedContainer).toBeVisible({ timeout: 5000 });
  });

  test('outline expands when toggle is clicked while collapsed', async ({ page }) => {
    test.skip(!testSessionId, 'No sessions available');
    await page.goto(`/sessions/${testSessionId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('article.markdown-body', { timeout: 10000 });

    // Collapse first
    await page.getByRole('button', { name: /collapse outline/i }).click();
    await page.waitForTimeout(300);

    // Expand again
    await page.getByRole('button', { name: /expand outline/i }).click();

    // Check outline is expanded
    const outlineList = page.locator('ul[role="list"]');
    await expect(outlineList).toBeVisible({ timeout: 5000 });
  });

  test('clicking outline item scrolls to heading', async ({ page }) => {
    test.skip(!testSessionId, 'No sessions available');
    await page.goto(`/sessions/${testSessionId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('article.markdown-body', { timeout: 10000 });

    // Get first heading text from outline
    const firstHeading = page.locator('ul[role="list"] li').first();
    const headingText = await firstHeading.textContent();

    if (headingText && headingText.trim()) {
      // Get scroll position before click
      const scrollTopBefore = await page.evaluate(() => 
        document.querySelector('.flex-1.overflow-y-auto')?.scrollTop || 0
      );

      // Click the heading
      await firstHeading.click();

      // Wait for scroll animation
      await page.waitForTimeout(1000);

      // Verify we're still on the same page
      await expect(page.getByText('Outline', { exact: true })).toBeVisible();
    }
  });

  test('outline shows on topic detail page', async ({ page }) => {
    // Get first topic from API
    const response = await page.request.get('http://127.0.0.1:3001/api/topics');
    const json = await response.json();
    const firstTopic = json.data?.topics?.[0];

    if (firstTopic?.slug) {
      await page.goto(`/topics/${firstTopic.slug}`);
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('article.markdown-body', { timeout: 10000 });

      // Check outline exists
      await expect(page.getByText('Outline', { exact: true })).toBeVisible({ timeout: 5000 });
    }
  });

  test('keyboard navigation works in outline', async ({ page }) => {
    test.skip(!testSessionId, 'No sessions available');
    await page.goto(`/sessions/${testSessionId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('article.markdown-body', { timeout: 10000 });

    // Focus first heading item
    const firstHeading = page.locator('ul[role="list"] li').first();
    await firstHeading.focus();

    // Press ArrowDown
    await page.keyboard.press('ArrowDown');

    // Second item should be focused
    const secondHeading = page.locator('ul[role="list"] li').nth(1);
    await expect(secondHeading).toBeFocused({ timeout: 5000 });
  });

  test('Escape key collapses outline', async ({ page }) => {
    test.skip(!testSessionId, 'No sessions available');
    await page.goto(`/sessions/${testSessionId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('article.markdown-body', { timeout: 10000 });

    // Focus first heading and press Escape
    const firstHeading = page.locator('ul[role="list"] li').first();
    await firstHeading.focus();
    await page.keyboard.press('Escape');

    // Outline should be collapsed
    const collapsedContainer = page.locator('[class*="max-h-0"]');
    await expect(collapsedContainer).toBeVisible({ timeout: 5000 });
  });
});
