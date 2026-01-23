const pool = require('../db/connect.js');

class IngestModel {
  constructor({ clientId, eventType, userId, logDateTime, ipAddress, status }) {
    this.clientId = clientId;
    this.eventType = eventType;
    this.userId = userId;
    this.logDateTime = logDateTime;
    this.ipAddress = ipAddress;
    this.status = status;
  }

  async insertLog() {
    const query = `
      INSERT INTO client_logs
        (client_id, event_type, user_id, log_date_time, ip_address, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      this.clientId,
      this.eventType,
      this.userId,
      this.logDateTime,
      this.ipAddress,
      this.status
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
  }
}

// MAX: Hey Maisie, I've added this function so I can get a list of unique IP addresses.
async function getDistinctIPs() {
  const query = `
    SELECT DISTINCT ip_address
    FROM client_logs
    WHERE ip_address IS NOT NULL
  `;

  const res = await pool.query(query);
  return res.rows.map(row => row.ip_address);
}

//Once the refresh is complete I want to flush out the client_log table, cause it's no longer needed
async function clearAllLogs() {
  await pool.query("TRUNCATE TABLE client_logs;")
}

module.exports = {
  IngestModel,
  getDistinctIPs,
  clearAllLogs
};