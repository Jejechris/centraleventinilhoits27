const bot = require('../src/bot');

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body, res);
      if (!res.headersSent) {
        res.status(200).json({ status: 'ok' });
      }
    } else {
      res.status(200).send('Central Event Command Center Bot is Live & Ready! 🚀');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
};
