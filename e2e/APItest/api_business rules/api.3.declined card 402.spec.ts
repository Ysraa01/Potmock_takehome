import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('declined card returns 402', async ({ request }) => {
  const createResponse = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Testpot Declined card',
      eventType: 'birthday',
      closingDate: '2026-12-31',
      recipientName: 'Declined User'
    }
  });
  expect(createResponse.status()).toBe(201);
  const createdPot = await createResponse.json();

  // Try to contribute with a declined card
  const contributionResponse = await request.post(`http://localhost:3000/api/pots/${createdPot.id}/contributions`, {
    data: {
      amount: 10,
      contributorName: 'Test Declined',
      cardNumber: '4000000000000002' // This card should be declined
    }
  });

  expect(contributionResponse.status()).toBe(402);
  const error = await contributionResponse.json();
});
