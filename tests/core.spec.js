import { test, expect } from '@playwright/test';

test.describe('Photo Booth E2E', () => {
    test('should go through the core flow: Start -> Capture -> Review', async ({ page }) => {
        // Enable console logging
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

        // 1. Visit Home
        await page.addInitScript(() => {
            window.IS_TEST_ENV = true;
        });
        await page.goto('/');

        // 2. Click Start Camera
        await page.getByText('Start Camera').click();
        await expect(page.locator('video')).toBeVisible();

        // 3. Test filter selection
        const filterBtn = page.getByRole('button', { name: 'Sepia' });
        await filterBtn.click();

        // 4. Test AR toggle (SKIPPED in headless to avoid GPU Stalls)
        // const arBtn = page.getByText('😎');
        // await arBtn.click();

        // 5. Capture
        // Click the capture button (last button in controls)
        await page.locator('.controls > button:last-child').click();

        // 6. Countdown - Verify countdown starts
        await expect(page.getByText('3', { exact: true })).toBeVisible({ timeout: 5000 });

        // 7. Verify Review Screen
        // "SMILE!" is too fast, so wait for result screen content
        await expect(page.getByText('Great Shot!')).toBeVisible({ timeout: 15000 });
        await expect(page.getByAltText('Captured')).toBeVisible();

        // 8. Download
        const downloadPromise = page.waitForEvent('download');
        await page.getByText('Download').click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('photo-');
    });
});
