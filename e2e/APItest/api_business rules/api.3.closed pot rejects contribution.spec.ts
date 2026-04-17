import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('closed pot rejects contributions', async ({ request }) => {
  const createResponse = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Testpot Closed',
      eventType: 'birthday',
      closingDate: '1950-04-01',
      recipientName: 'Testrecipient Closed'
    }
  });
  expect(createResponse.status()).toBe(201);
  const createdPot = await createResponse.json();

  const contributionResponse = await request.post(`http://localhost:3000/api/pots/${createdPot.id}/contributions`, {
    data: {
      amount: 10,
      contributorName: 'Testcontributor Closed',
      cardNumber: '1234567812345678'
    }
  });

  expect(contributionResponse.status()).toBe(403);
  const error = await contributionResponse.json();
});

//Error, pot is closed, contribution is expected to be rejected with 403, but it is accepted with 201. This is a bug that needs to be fixed.