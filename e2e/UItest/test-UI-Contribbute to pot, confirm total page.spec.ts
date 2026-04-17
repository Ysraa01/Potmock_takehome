import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page, request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('Contribute to pot, confirm total', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sarah\'s Wedding' }).click();
  await page.getByRole('textbox', { name: 'Your name' }).click();
  await page.getByRole('textbox', { name: 'Your name' }).fill('Test contributor1');
  await page.getByRole('spinbutton', { name: 'Amount (USD)' }).click();
  await page.getByRole('spinbutton', { name: 'Amount (USD)' }).fill('20');
  await page.getByRole('textbox', { name: 'Card number' }).click();
  await page.getByRole('textbox', { name: 'Card number' }).fill('1234567812345678');
  await page.getByRole('button', { name: 'Contribute' }).click();
  await expect(page.getByText('Total collected')).toBeVisible();
});