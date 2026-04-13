const express = require('express');
const { db, reset } = require('../db');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/event-types', (req, res) => {
  res.json(['birthday', 'wedding', 'honeymoon', 'retirement', 'other']);
});

function serializePot(row) {
  return {
    id: row.id,
    title: row.title,
    eventType: row.event_type,
    closingDate: row.closing_date,
    recipientName: row.recipient_name,
    createdAt: row.created_at,
  };
}

router.get('/pots', (req, res) => {
  const rows = db.prepare('SELECT * FROM pots ORDER BY id ASC').all();
  const totals = db
    .prepare('SELECT pot_id, SUM(amount) AS total FROM contributions GROUP BY pot_id')
    .all();
  const totalByPot = Object.fromEntries(totals.map((r) => [r.pot_id, r.total]));
  res.json(
    rows.map((r) => ({
      ...serializePot(r),
      totalCents: totalByPot[r.id] || 0,
    }))
  );
});

router.get('/pots/:id', (req, res) => {
  const pot = db.prepare('SELECT * FROM pots WHERE id = ?').get(req.params.id);
  if (!pot) return res.status(404).json({ error: 'not found' });

  const contributions = db
    .prepare('SELECT * FROM contributions WHERE pot_id = ? ORDER BY id ASC')
    .all(pot.id);
  const totalCents = contributions.reduce((s, c) => s + c.amount, 0);

  res.json({
    ...serializePot(pot),
    totalCents,
    contributions: contributions.map((c) => ({
      id: c.id,
      contributorName: c.contributor_name,
      amountCents: c.amount,
      cardLast4: c.card_last4,
      createdAt: c.created_at,
    })),
  });
});

// Remaining routes added in Tasks 4 and 5

router.post('/pots', express.json(), (req, res) => {
  const { title, eventType, closingDate, recipientName } = req.body || {};
  if (!title || !eventType || !closingDate || !recipientName) {
    return res
      .status(400)
      .json({ error: 'title, eventType, closingDate, recipientName are required' });
  }
  const allowed = ['birthday', 'wedding', 'honeymoon', 'retirement', 'other'];
  if (!allowed.includes(eventType)) {
    return res.status(400).json({ error: 'invalid eventType' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(closingDate)) {
    return res.status(400).json({ error: 'closingDate must be YYYY-MM-DD' });
  }
  const info = db
    .prepare(
      'INSERT INTO pots (title, event_type, closing_date, recipient_name) VALUES (?, ?, ?, ?)'
    )
    .run(title, eventType, closingDate, recipientName);
  const row = db.prepare('SELECT * FROM pots WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({
    id: row.id,
    title: row.title,
    eventType: row.event_type,
    closingDate: row.closing_date,
    recipientName: row.recipient_name,
    createdAt: row.created_at,
    totalCents: 0,
  });
});

// Bug #4: off-by-one — uses <= instead of <, so a pot closing TODAY is already closed.
function isPotClosed(closingDate) {
  const today = new Date().toISOString().slice(0, 10);
  return closingDate <= today;
}

router.get('/pots/:id/contributions', (req, res) => {
  const pot = db.prepare('SELECT id FROM pots WHERE id = ?').get(req.params.id);
  if (!pot) return res.status(404).json({ error: 'not found' });

  // Bug #5: returns in insertion order, but UI claims "most recent first".
  const rows = db
    .prepare('SELECT * FROM contributions WHERE pot_id = ? ORDER BY id ASC')
    .all(pot.id);
  res.json(
    rows.map((c) => ({
      id: c.id,
      contributorName: c.contributor_name,
      amountCents: c.amount,
      cardLast4: c.card_last4,
      createdAt: c.created_at,
    }))
  );
});

router.post('/pots/:id/contributions', express.json(), (req, res) => {
  const pot = db.prepare('SELECT * FROM pots WHERE id = ?').get(req.params.id);
  if (!pot) return res.status(404).json({ error: 'not found' });

  const { contributorName, amount, cardNumber } = req.body || {};
  if (!contributorName || amount === undefined || !cardNumber) {
    return res
      .status(400)
      .json({ error: 'contributorName, amount, cardNumber are required' });
  }
  if (typeof cardNumber !== 'string' || !/^\d{16}$/.test(cardNumber)) {
    return res.status(400).json({ error: 'cardNumber must be 16 digits' });
  }
  if (cardNumber === '4000000000000002') {
    return res.status(402).json({ error: 'payment declined' });
  }

  // Bug #1 INTENTIONALLY MISSING: no check against isPotClosed(pot.closing_date).
  // The API accepts contributions on closed pots even though the UI hides the form.
  // DO NOT ADD A CHECK HERE.

  // Bug #2 INTENTIONALLY MISSING: no `amount > 0` validation.
  // Negative amounts are accepted and reduce the pot total.
  // DO NOT ADD A CHECK HERE.

  const cents = Math.round(Number(amount) * 100);
  const last4 = cardNumber.slice(-4);
  const info = db
    .prepare(
      'INSERT INTO contributions (pot_id, contributor_name, amount, card_last4) VALUES (?, ?, ?, ?)'
    )
    .run(pot.id, contributorName, cents, last4);

  res.status(201).json({
    id: info.lastInsertRowid,
    potId: pot.id,
    contributorName,
    amountCents: cents,
    cardLast4: last4,
  });
});

router.post('/_reset', (req, res) => {
  reset();
  res.json({ status: 'reset' });
});

module.exports = router;
