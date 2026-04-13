import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import { reset } from '../src/db.js';

beforeEach(() => reset());

describe('PotMock non-bug sanity', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/event-types returns the 5 expected types', async () => {
    const res = await request(app).get('/api/event-types');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(['birthday', 'wedding', 'honeymoon', 'retirement', 'other']);
  });

  it('GET /api/pots returns seeded pots with totals', async () => {
    const res = await request(app).get('/api/pots');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
    expect(res.body[0]).toHaveProperty('totalCents');
  });

  it('POST /api/pots creates a pot with a future closingDate', async () => {
    const res = await request(app)
      .post('/api/pots')
      .send({
        title: 'Test pot',
        eventType: 'birthday',
        closingDate: '2099-01-01',
        recipientName: 'Test',
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeGreaterThan(0);
  });

  it('POST /api/pots rejects missing fields', async () => {
    const res = await request(app).post('/api/pots').send({ title: 'x' });
    expect(res.status).toBe(400);
  });

  it('POST /api/pots rejects invalid eventType', async () => {
    const res = await request(app).post('/api/pots').send({
      title: 'x',
      eventType: 'nope',
      closingDate: '2099-01-01',
      recipientName: 'y',
    });
    expect(res.status).toBe(400);
  });

  it('POST contribution with declined card returns 402', async () => {
    const res = await request(app).post('/api/pots/1/contributions').send({
      contributorName: 'Bad',
      amount: 10,
      cardNumber: '4000000000000002',
    });
    expect(res.status).toBe(402);
  });

  it('POST contribution with non-16-digit card returns 400', async () => {
    const res = await request(app).post('/api/pots/1/contributions').send({
      contributorName: 'Bad',
      amount: 10,
      cardNumber: '123',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/_reset restores seed data', async () => {
    await request(app).post('/api/pots/1/contributions').send({
      contributorName: 'X',
      amount: 1,
      cardNumber: '4111111111111111',
    });
    await request(app).post('/api/_reset');
    const res = await request(app).get('/api/pots');
    expect(res.body.length).toBe(3);
  });
});
