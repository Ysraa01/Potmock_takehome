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

router.get('/pots/:id', (req, res) => {
  const pot = db.prepare('SELECT * FROM pots WHERE id = ?').get(req.params.id);
  if (!pot) return res.status(404).send(layout('Not found', '<p>Pot not found.</p>'));

  const contributions = db
    .prepare('SELECT * FROM contributions WHERE pot_id = ? ORDER BY id ASC')
    .all(pot.id);
  const total = contributions.reduce((s, c) => s + c.amount, 0);
  const closed = isClosed(pot.closing_date);

  const contribList = contributions
    .map(
      (c) =>
        `<li>${escapeHtml(c.contributor_name)} — ${formatDollars(c.amount)} (card ****${escapeHtml(c.card_last4)})</li>`
    )
    .join('');

  const contributeForm = closed
    ? '<p class="closed">This pot is closed.</p>'
    : `
    <h2>Contribute</h2>
    <form method="POST" action="/pots/${pot.id}/contribute">
      <label>Your name <input name="contributorName" required></label>
      <label>Amount (USD) <input name="amount" type="number" step="0.01" required></label>
      <label>Card number <input name="cardNumber" required pattern="\\d{16}"></label>
      <button type="submit">Contribute</button>
    </form>`;

  // Bug #3 INTENTIONALLY: `pot.title` rendered UNESCAPED below.
  // Every other field uses escapeHtml(). DO NOT add escapeHtml() here.
  const body = `
    <h1>${pot.title}</h1>
    <p>For: ${escapeHtml(pot.recipient_name)} · Event: ${escapeHtml(pot.event_type)}</p>
    <p>Closes: ${escapeHtml(pot.closing_date)}${closed ? ' <span class="closed">(closed)</span>' : ''}</p>
    <p>Total collected: <strong data-total>${formatDollars(total)}</strong></p>
    <h2>Contributions <small>(most recent first)</small></h2>
    <ul data-contributions>${contribList || '<li>No contributions yet.</li>'}</ul>
    ${contributeForm}`;

  res.send(layout(pot.title, body));
});

router.post('/pots/:id/contribute', express.urlencoded({ extended: false }), (req, res) => {
  const pot = db.prepare('SELECT * FROM pots WHERE id = ?').get(req.params.id);
  if (!pot) return res.status(404).send(layout('Not found', '<p>Pot not found.</p>'));

  const { contributorName, amount, cardNumber } = req.body;
  if (!contributorName || !amount || !cardNumber || !/^\d{16}$/.test(cardNumber)) {
    return res.status(400).send(layout('Error', '<p>Invalid form submission.</p>'));
  }
  if (cardNumber === '4000000000000002') {
    return res.status(402).send(layout('Declined', '<p>Payment declined.</p>'));
  }
  const cents = Math.round(Number(amount) * 100);
  db.prepare(
    'INSERT INTO contributions (pot_id, contributor_name, amount, card_last4) VALUES (?, ?, ?, ?)'
  ).run(pot.id, contributorName, cents, cardNumber.slice(-4));
  res.redirect(`/pots/${pot.id}`);
});

module.exports = router;
