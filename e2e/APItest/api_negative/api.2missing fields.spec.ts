import { test, expect } from '@playwright/test';

test.beforeEach(async ({request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('missing field - eventType', async ({ request }) => {
  const response = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Test Pot',
      closingDate: '2026-12-31',
      recipientName: 'Testcontribute1'
    }
  });

  expect(response.status()).toBe(400);
  const pot = await response.json();
  expect(pot).toHaveProperty('error', 'missing field: eventType');
});