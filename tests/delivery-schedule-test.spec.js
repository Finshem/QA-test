/**
 * Delivery schedule autotest
 *
 * Setup (one-time):
 *   npm install --save-dev @playwright/test better-sqlite3
 *   npx playwright install chromium
 *
 * Place delivery.db in the same directory as this file, then run:
 *   npx playwright test delivery-schedule-test.spec.js
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const Database = require('better-sqlite3');

// ---------------------------------------------------------------------------
// Helper – query expected delivery days from the local SQLite database
// ---------------------------------------------------------------------------
function getExpectedDeliveryDays(dbPath) {
  const db = new Database(dbPath, { readonly: true });
  const row = db.prepare(`
    SELECT delivery_days
    FROM routes r
    JOIN warehouses w ON r.warehouse_id = w.id
    JOIN cities c     ON r.city_id      = c.id
    WHERE w.city    = 'Москва'
      AND c.name    = 'Волгоград'
      AND r.is_active = 1
  `).get();
  db.close();
  if (!row) throw new Error('No active route Москва → Волгоград found in DB');
  return row.delivery_days;
}

// ---------------------------------------------------------------------------
// Helper – parse a "DD.MM" string into a Date (current year assumed)
// ---------------------------------------------------------------------------
function parseDate(ddMm) {
  const [day, month] = ddMm.split('.').map(Number);
  return new Date(new Date().getFullYear(), month - 1, day);
}

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------
test('Delivery schedule: departure 22.02 → arrival 24.02 equals DB delivery days', async ({ page }) => {

  // --- 1. Read expected value from the database ----------------------------
  const DB_PATH = path.resolve(__dirname, '..', 'fixtures', 'delivery.db');
  const expectedDays = getExpectedDeliveryDays(DB_PATH);
  console.log(`  DB expected delivery days (Москва → Волгоград): ${expectedDays}`);

  // --- 2. Calculate the UI difference --------------------------------------
  const DEPARTURE = '24.02';
  const ARRIVAL   = '26.02';

  const departureDate = parseDate(DEPARTURE);
  const arrivalDate   = parseDate(ARRIVAL);
  const diffMs        = arrivalDate - departureDate;
  const actualDays    = Math.round(diffMs / (1000 * 60 * 60 * 24));

  console.log(`  UI date difference (${ARRIVAL} − ${DEPARTURE}): ${actualDays} day(s)`);

  // --- 3. Assert DB value matches the calculated difference -----------------
  expect(
    actualDays,
    `Expected UI date difference (${actualDays}) to equal DB delivery_days (${expectedDays})`
  ).toBe(expectedDays);

  // --- 4. Navigate and interact with the delivery schedule page -------------
  await page.waitForTimeout(3000);
  await page.goto('https://altlog.ru/grafik-dostavok-sbornyh-gruzov');

  await expect(page).toHaveTitle(/Доставка сборных грузов/, { timeout: 15000 });

  // Select the destination city – Волгоград
  await page.locator('.selectize-input.items.not-full').first().click();
  await page.locator('#dsFilters').getByText('Волгоград').click();

  // Click the arrival date first, then the departure date
  // (matching the order used during codegen recording)
  await page.getByText(ARRIVAL).first().click();
  await page.getByText(DEPARTURE).first().click();
  

  // --- 5. Verify the clicked dates are visible on the page -----------------
  await expect(page.getByText(ARRIVAL).first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(DEPARTURE).first()).toBeVisible({ timeout: 10000 });
  

  console.log(
    `✓ Delivery schedule test passed – ` +
    `UI diff ${actualDays} day(s) matches DB delivery_days ${expectedDays} day(s)`
  );
});