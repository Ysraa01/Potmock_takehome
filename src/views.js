function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)} — PotMock</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
  h1, h2 { margin-top: 1.5rem; }
  nav a { margin-right: 1rem; }
  form { display: grid; gap: 0.5rem; margin: 1rem 0; }
  label { display: grid; gap: 0.25rem; }
  input, select, button { padding: 0.4rem; font-size: 1rem; }
  .pot { border: 1px solid #ccc; padding: 1rem; margin: 0.5rem 0; }
  .closed { color: #a00; font-weight: bold; }
</style>
</head>
<body>
<nav><a href="/">Home</a><a href="/pots/new">New pot</a></nav>
${body}
</body>
</html>`;
}

function formatDollars(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function isClosed(closingDate) {
  const today = new Date().toISOString().slice(0, 10);
  return closingDate <= today; // matches API bug #4 on purpose
}

module.exports = { escapeHtml, layout, formatDollars, isClosed };
