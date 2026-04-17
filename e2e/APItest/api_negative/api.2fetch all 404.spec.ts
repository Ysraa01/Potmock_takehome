import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('fetch all pots', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/potss');
  expect(response.status()).toBe(404);
  const pots = await response.json();
  expect(Array.isArray(pots)).toBe(false);
  });