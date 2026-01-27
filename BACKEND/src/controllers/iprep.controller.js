//This controller will allow the manual refresh
const {enrichRecentIPs} = require("../services/detectionService.js")
const pool = require('../db/connect.js');

async function refresh_ip_reputation(req, res) {
    try {
        const result = await enrichRecentIPs()

        return res.status(200).json({
            success: true,
            message: "IP reputation has been sucessfully refreshed",
            count: result.length,
            data: result
        })
    } catch (error) {
        console.error("An error refreshing the IP reputations has occurred:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to refresh the IP reputation", 
            error: error.message
        })
    }
}

const getIpReputation = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ip_address,
        abuse_confidence,
        usage_type,
        country_name,
        total_reports,
        last_reported_at,
        checked_at
      FROM ip_reputation
    `);

    res.json({ data: result.rows });
  } catch (err) {
    console.error("Error fetching IP reputation:", err);
    res.status(500).json({ error: "Failed to fetch IP reputation data" });
  }
};


module.exports = {
    refresh_ip_reputation,
    getIpReputation
}