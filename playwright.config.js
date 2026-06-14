import { defineConfig } from '@playwright/test';

const baseURL =
    process.env.BASE_URL ?? 'https://project.orbit.au.dk/alt-2026f01';

export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    retries: process.env.CI ? 2 : 0,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL,
        headless: true,
        trace: 'on-first-retry',
    },
});
