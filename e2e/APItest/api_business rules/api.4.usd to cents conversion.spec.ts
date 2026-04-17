import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('USD to cents conversion is correct', async ({ request }) => {
  const createResponse = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Cents Conversion Pot',
      eventType: 'birthday',
      closingDate: '2026-12-31',
      recipientName: 'Cents User'
    }
  });
  expect(createResponse.status()).toBe(201);
  const createdPot = await createResponse.json();

  // Contribute $12.34
  const contributionAmount = 12.34;
  const contributionResponse = await request.post(`http://localhost:3000/api/pots/${createdPot.id}/contributions`, {
    data: {
      amount: contributionAmount,
      contributorName: 'Cents Tester',
      cardNumber: '4111111111111111'
    }
  });
  expect(contributionResponse.status()).toBe(201);

  // Fetch the pot and verify totalCents
  const fetchResponse = await request.get(`http://localhost:3000/api/pots/${createdPot.id}`);
  expect(fetchResponse.status()).toBe(200);
  const updatedPot = await fetchResponse.json();
  expect(updatedPot.totalCents).toBe(1234);
});
