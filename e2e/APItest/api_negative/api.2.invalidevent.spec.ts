import { test, expect } from '@playwright/test';

test.beforeEach(async ({request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('invalid event type', async ({ request }) => {
  const response = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Test Pot',
      eventType: 'my little pony',
      closingDate: '2026-12-31',
      recipientName: 'Testrecipient1 Invalidevent'
    }
  });

  expect(response.status()).toBe(400);
  const pot = await response.json();
  expect(pot).toHaveProperty('error', 'invalid eventType');
});
