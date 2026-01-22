const pool = require('../db/connect.js');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

  async function createClient({ name, email, password }) {
    const hash = await bcrypt.hash(password, 10);
    const apiKey = uuidv4();
    const res = await pool.query(
      'INSERT INTO clients (name, email, password_hash, api_key) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, email, hash, apiKey]
    );
    return res.rows[0];
  },

  async function getClientByEmail(email) {
    const res = await pool.query('SELECT * FROM clients WHERE email=$1', [email]);
    return res.rows[0];
  },

  async function getClientByApiKey(apiKey) {
    const res = await pool.query('SELECT * FROM clients WHERE api_key=$1', [apiKey]);
    return res.rows[0];
  },

  async function regenerateApiKey(clientId) {
    const newKey = uuidv4();
    const res = await pool.query(
      'UPDATE clients SET api_key=$1, updated_at=NOW() WHERE id=$2 RETURNING api_key',
      [newKey, clientId]
    );
    return res.rows[0].api_key;
  },

  async function verifyPassword(client, password) {
    return await bcrypt.compare(password, client.password_hash);
  }

  module.exports = {
    createClient,
    getClientByEmail,
    getClientByApiKey,
    regenerateApiKey,
    verifyPassword
  };