import { test, expect } from '@playwright/test';

test.beforeEach(async ({request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('create a pot', async ({ request }) => {
  const response = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Test Pot',
      eventType: 'birthday',
      closingDate: '2026-12-31',
      recipientName: 'John Doe'
    }
  });

  expect(response.status()).toBe(201);
  const pot = await response.json();
  expect(pot).toHaveProperty('title', 'Test Pot');
  expect(pot).toHaveProperty('recipientName', 'John Doe');
});
