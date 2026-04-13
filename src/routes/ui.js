const express = require('express');
const { db } = require('../db');
const { layout, escapeHtml, formatDollars, isClosed } = require('../views');

const router = express.Router();

router.get('/', (req, res) => {
  const pots = db.prepare('SELECT * FROM pots ORDER BY id ASC').all();
  const totals = db
    .prepare('SELECT pot_id, SUM(amount) AS total FROM contributions GROUP BY pot_id')
    .all();
  const totalByPot = Object.fromEntries(totals.map((r) => [r.pot_id, r.total]));

  const items = pots
    .map((p) => {
      const total = totalByPot[p.id] || 0;
      const closed = isClosed(p.closing_date);
      return `
        <div class="pot" data-pot-id="${p.id}">
          <h2><a href="/pots/${p.id}">${escapeHtml(p.title)}</a></h2>
          <p>Event: ${escapeHtml(p.event_type)} · Closes: ${escapeHtml(p.closing_date)}${closed ? ' <span class="closed">(closed)</span>' : ''}</p>
          <p>Total collected: <strong data-total>${formatDollars(total)}</strong></p>
        </div>`;
    })
    .join('');

  res.send(layout('Pots', `<h1>Pots</h1>${items || '<p>No pots yet.</p>'}`));
});

router.get('/pots/new', (req, res) => {
  const body = `
    <h1>Create a pot</h1>
    <form method="POST" action="/pots/new">
      <label>Title <input name="title" required></label>
      <label>Event type
        <select name="eventType" required>
          <option value="birthday">Birthday</option>
          <option value="wedding">Wedding</option>
          <option value="honeymoon">Honeymoon</option>
          <option value="retirement">Retirement</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>Closing date <input name="closingDate" type="date" required></label>
      <label>Recipient name <input name="recipientName" required></label>
      <button type="submit">Create pot</button>
    </form>`;
  res.send(layout('New pot', body));
});

router.post('/pots/new', express.urlencoded({ extended: false }), (req, res) => {
  const { title, eventType, closingDate, recipientName } = req.body;
  if (!title || !eventType || !closingDate || !recipientName) {
    return res.status(400).send(layout('Error', '<p>Missing fields.</p>'));
  }
  const info = db
    .prepare(
      'INSERT INTO pots (title, event_type, closing_date, recipient_name) VALUES (?, ?, ?, ?)'
    )
    .run(title, eventType, closingDate, recipientName);
  res.redirect(`/pots/${info.lastInsertRowid}`);
});

module.exports = router;
