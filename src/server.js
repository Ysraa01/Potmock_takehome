const express = require('express');
const apiRoutes = require('./routes/api');
const uiRoutes = require('./routes/ui');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use('/api', apiRoutes);
app.use('/', uiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`PotMock listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
