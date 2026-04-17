import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('From home to pot and back', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Dad\'s Retirement' }).click();
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: 'Pots' })).toBeVisible();
});