const { refresh_alerts_from_sources, get_stored_alerts } = require("../models/alerts.model.js");

async function refresh_alerts(req, res) {
  try {
    const {
      window_minutes = 60,
      failed_threshold = 3,
      abuse_threshold = 50,
    } = req.body;

    const result = await refresh_alerts_from_sources({
      window_minutes,
      failed_threshold,
      abuse_threshold,
    });

    return res.status(200).json({
      success: true,
      message: 'Alerts refreshed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error refreshing alerts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh alerts',
      error: error.message,
    });
  }
}

async function get_alerts(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const alerts = await get_stored_alerts({ limit });
    
    return res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message,
    });
  }
}

module.exports = {
  refresh_alerts,
  get_alerts,
};