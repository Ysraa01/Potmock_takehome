import { test, expect } from '@playwright/test';

test.beforeEach(async ({request }) => {
  await request.post('http://localhost:3000/api/_reset');
});

test('create a pot then fetch it', async ({ request }) => {
  const createResponse = await request.post('http://localhost:3000/api/pots', {
    data: {
      title: 'Test Pot',
      eventType: 'birthday',
      closingDate: '2026-12-31',
      recipientName: 'John Doe'
    }
  });

  expect(createResponse.status()).toBe(201);
  const createdPot = await createResponse.json();
  expect(createdPot).toHaveProperty('title', 'Test Pot');
  expect(createdPot).toHaveProperty('recipientName', 'John Doe');

  const fetchResponse = await request.get(`http://localhost:3000/api/pots/${createdPot.id}`);
  expect(fetchResponse.status()).toBe(200);
  const fetchedPot = await fetchResponse.json();
  expect(fetchedPot.title).toBe('Test Pot');
  expect(fetchedPot.recipientName).toBe('John Doe');
  expect(fetchedPot.eventType).toBe('birthday');
});
