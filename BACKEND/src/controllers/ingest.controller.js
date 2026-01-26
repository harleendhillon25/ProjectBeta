const pool = require('../db/connect.js');
const { IngestModel } = require('../models/ingest.model.js');

async function ingestLog(req, res) {
  try {
    const clientId = req.clientId || 1; // from auth middleware
    const { eventType, userId, logDateTime, ipAddress, status } = req.body;

    // Validation
    if (!eventType || !userId || !logDateTime || !ipAddress || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create IngestModel instance
    const log = new IngestModel({
      clientId,
      eventType,
      userId,
      logDateTime,
      ipAddress,
      status
    });

    // Insert log into DB
    const insertedLog = await log.insertLog();

    res.status(201).json({ message: 'Log ingested', log: insertedLog });

  } catch (err) {
    console.error('Error ingesting log:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getLogs(req, res) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM client_logs
      ORDER BY log_date_time DESC
      LIMIT 500
    `);

    res.json({ data: result.rows });
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { ingestLog, getLogs };