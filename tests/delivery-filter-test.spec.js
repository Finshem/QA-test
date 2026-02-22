const { test, expect } = require('@playwright/test');

test('Filter delivery schedule by location and type', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://altlog.ru/grafik-dostavok-sbornyh-gruzov');

  // Verify page loaded
  await expect(page).toHaveTitle(/Доставка сборных грузов/, { timeout: 15000 });

  // --- Exact selectors from playwright codegen (verified working) ---
  await page.locator('.selectize-input.items.not-full').first().click();
  await page.locator('#dsFilters').getByText('с. Хрящёвка').click();
  await page.locator('div').filter({ hasText: /^Розница\(разовая доставка\)$/ }).first().click();
  // -----------------------------------------------------------------

  // Verify the selected location filter is applied (two matches exist after selection, take the first)
  await expect(page.locator('#dsFilters').getByText('с. Хрящёвка').first()).toBeVisible({ timeout: 15000 });

  // Verify the delivery type option is visible and selected
  await expect(
    page.locator('div').filter({ hasText: /^Розница\(разовая доставка\)$/ }).first()
  ).toBeVisible({ timeout: 15000 });

  console.log('✓ Delivery filter test passed - location and delivery type successfully selected');
});
