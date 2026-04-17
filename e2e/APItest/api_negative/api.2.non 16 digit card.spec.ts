import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('non 16 digit card number is rejected', async ({ request }) => {
  const createResponse = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Testpot Non16digitcard',
      eventType: 'birthday',
      closingDate: '2099-04-01',
      recipientName: 'Testrecipient Non16digitcard'
    }
  });
  expect(createResponse.status()).toBe(201);
  const createdPot = await createResponse.json();

  const contributionResponse = await request.post(`http://localhost:3000/api/pots/${createdPot.id}/contributions`, {
    data: {
      amount: 10,
      contributorName: 'Testcontributor Non16digitcard',
      cardNumber: '12345678123456'
    }
  });

  expect(contributionResponse.status()).toBe(400);
  const error = await contributionResponse.json();
});