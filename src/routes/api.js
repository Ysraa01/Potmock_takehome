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
module.exports = router;
