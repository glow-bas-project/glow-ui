import { test, expect } from '@playwright/test';

test('home page loads @smoke @service:ui', async ({ page }) => {
    const response = await page.goto('');
    expect(response?.ok()).toBeTruthy();

    await expect(page).toHaveTitle(/glow-ui/i);
    await expect(
        page.getByRole('heading', { name: 'Restaurant discovery, simplified' }),
    ).toBeVisible();
});
