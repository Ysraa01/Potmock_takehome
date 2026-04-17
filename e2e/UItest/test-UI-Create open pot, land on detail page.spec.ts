import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('Create open pot, land on detail page', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'New pot' }).click();
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Testpot1');
  await page.getByLabel('Event type Birthday Wedding').selectOption('wedding');
  await page.getByRole('textbox', { name: 'Closing date' }).fill('2099-12-30');
  await page.getByRole('textbox', { name: 'Recipient name' }).click();
  await page.getByRole('textbox', { name: 'Recipient name' }).fill('Testrecipient1');
  await page.getByRole('button', { name: 'Create pot' }).click();
  await expect(page).toHaveTitle('Testpot1 — PotMock');
});
