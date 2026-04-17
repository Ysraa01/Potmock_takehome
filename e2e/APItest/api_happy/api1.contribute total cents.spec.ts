import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('add contribution and verify totalCents', async ({ request }) => {
  const createResponse = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Testpot Cents',
      eventType: 'birthday',
      closingDate: '2026-12-30',
      recipientName: 'Testrecipient1 Cents'
    }
  });

  expect(createResponse.status()).toBe(201);
  const createdPot = await createResponse.json();
  const potId = createdPot.id;

  const contributionAmount = 50; 
  const contributionResponse = await request.post(`http://localhost:3000/api/pots/${potId}/contributions`, {
    data: {
      amount: contributionAmount,
      contributorName: 'Testcontribute1 Cents',
      cardNumber: '1234567812345678'
    }
  });

  expect(contributionResponse.status()).toBe(201);

  const fetchResponse = await request.get(`http://localhost:3000/api/pots/${potId}`);
  expect(fetchResponse.status()).toBe(200);
  const updatedPot = await fetchResponse.json();
  
  const expectedCents = Math.round(contributionAmount * 100);
  expect(updatedPot.totalCents).toBe(expectedCents);
});
