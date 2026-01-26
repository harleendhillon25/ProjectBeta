const jwt = require('jsonwebtoken');
const clientModel = require('../models/clients.model.js');

  async function register(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
      const client = await clientModel.createClient({ name, email, password });
      res.status(201).json({ message: 'Client created', clientId: client.id, apiKey: client.api_key });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async function login(req, res) {
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);  // ← Add this
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);  // ← Add this
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
      const client = await clientModel.getClientByEmail(email);
      if (!client) return res.status(401).json({ error: 'Invalid credentials' });

      const isValid = await clientModel.verifyPassword(client, password);
      if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ clientId: client.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
      res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  async function regenerateApiKey(req, res) {
    try {
      const newKey = await clientModel.regenerateApiKey(req.clientId);
      res.status(200).json({ message: 'API key regenerated', apiKey: newKey });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }

module.exports = { register, login, regenerateApiKey }