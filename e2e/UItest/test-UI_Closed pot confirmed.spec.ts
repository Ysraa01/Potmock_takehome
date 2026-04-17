import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('Closed pot confirmed', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Anna Birthday' }).click();
  await expect(page.getByText('This pot is closed.')).toBeVisible();
  await expect(page.getByText('(closed)')).toBeVisible();
});