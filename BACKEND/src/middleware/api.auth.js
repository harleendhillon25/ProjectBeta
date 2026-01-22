const clientModel = require('../models/clients.model.js');

module.exports = async function apiKeyAuth(req, res, next) {
  const apiKey = req.header('x-api-key');
  if (!apiKey) return res.status(401).json({ error: 'API key required' });

  const client = await clientModel.getClientByApiKey(apiKey);
  if (!client) return res.status(403).json({ error: 'Invalid API key' });

  req.clientId = client.id;
  next();
};