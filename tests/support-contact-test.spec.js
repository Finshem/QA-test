const { test, expect } = require('@playwright/test');

test('Contact support team and verify message delivery', async ({ page }) => {
  // Navigate to the page
  await page.waitForTimeout(3000); // let the server breathe after prior tests
  await page.goto('https://altlog.ru/grafik-dostavok-sbornyh-gruzov');

  // Verify page loaded
  await expect(page).toHaveTitle(/Доставка сборных грузов/, { timeout: 15000 });

  // --- Exact selectors from playwright codegen (verified working) ---
  await page.getByText('Бот').click();
  await page.getByRole('textbox', { name: 'Введите сообщение' }).click();

  const testMessage = 'Hello! I need your support, please reach out!';
  await page.getByRole('textbox', { name: 'Введите сообщение' }).fill(testMessage);
  await page.getByRole('button', { name: 'Отправить сообщение' }).click();
  // -----------------------------------------------------------------

  // Verify the sent message appears in the chat
  await expect(page.getByText(testMessage)).toBeVisible({ timeout: 15000 });

  // Bitrix24 system confirmations are non-deterministic in timing and order.
  // Retry until at least one confirmation appears, or timeout.
  await expect(async () => {
    const results = await Promise.allSettled([
      expect(page.getByText(/Соединение с сервером установлено/)).toBeVisible({ timeout: 1000 }),
      expect(page.getByText(/Диалог №\d+/)).toBeVisible({ timeout: 1000 }),
      expect(page.getByText(/Добро пожаловать в Открытую линию/)).toBeVisible({ timeout: 1000 }),
    ]);

    if (!results.some(r => r.status === 'fulfilled')) {
      throw new Error('No system confirmation message appeared after sending');
    }
  }).toPass({ timeout: 20000, intervals: [1000, 2000, 3000] });

  console.log('✓ Support contact test passed - message successfully delivered to support team');
});