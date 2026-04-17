import { test, expect } from '@playwright/test';

test.beforeEach(async ({request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('malformed closing date', async ({ request }) => {
  const response = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Testpot Malformed Closing Date',
      eventType: 'birthday',
      closingDate: '2026-300-12',
      recipientName: 'Testrecipient Malformedclosingdate'
    }
  });

  expect(response.status()).toBe(403);
  const pot = await response.json();
  expect(pot).toHaveProperty('error', 'invalid closingDate');
});
