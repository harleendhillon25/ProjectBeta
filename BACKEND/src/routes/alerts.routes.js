const express = require("express");
const {
  get_alerts,
  refresh_alerts,
} = require("../controllers/alerts.controller.js");

const router = express.Router();

// GET /alerts - Retrieve stored alerts
router.get("/", get_alerts);

// POST /alerts/refresh - Trigger alert detection
router.post("/refresh", refresh_alerts);

module.exports = router;