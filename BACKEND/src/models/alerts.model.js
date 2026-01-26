
const pool = require('../db/connect.js');

/*
 * refreshAlertsFromSources
 * 1) derives suspicious activity from client_logs and ip_reputation
 * 2) calculates severity
 * 3) upserts into alerts table
 *
 * Returns counts of what it upserted.
 */


async function refresh_alerts_from_sources({
  window_minutes = 60,
  failed_threshold = 3,
  abuse_threshold = 50,
} = {}) {
  const client = await pool.connect();


  try {
    await client.query("BEGIN");

    // Failed login bursts by IP

    const failed_sql = `
      SELECT
        ip_address,
        COUNT(*)::int AS failed_count,
        MAX(log_date_time) AS last_seen
      FROM client_logs
      WHERE status = 'FAILURE'
        AND log_date_time >= NOW() - ($1::text || ' minutes')::interval
      GROUP BY ip_address
      HAVING COUNT(*) > $2
      ORDER BY last_seen DESC
    `;

    const failed_res = await client.query(failed_sql, [String(window_minutes), failed_threshold]);

    let failed_upserts = 0;

    for (const row of failed_res.rows) {
      const ip_address = row.ip_address;
      const failed_count = row.failed_count;
      const last_seen = row.last_seen;

      const severity = severity_from_failed_count(failed_count);

      const details = {
        failed_count: failed_count,
        window_minutes,
        threshold: failed_threshold,
        last_seen,
      };

      await upsert_alert_tx(client, {
        alert_type: "FAILED_LOGIN_BURST",
        ip_address,
        severity,
        details,
      });

      failed_upserts += 1;
    }

    // High AbuseIPDB scores

    const ip_rep_sql = `
    SELECT DISTINCT ON (ip_address)
      ip_address,
      abuse_confidence,
      usage_type,
      country_name,
      total_reports,
      last_reported_at,
      checked_at
    FROM ip_reputation
    WHERE abuse_confidence >= $1
    ORDER BY ip_address, checked_at DESC
    `;

    const ip_rep_res = await client.query(ip_rep_sql, [abuse_threshold]);

    let ip_rep_upserts = 0;

    for (const row of ip_rep_res.rows) {
      const ip_address = row.ip_address;
      const abuse_confidence = row.abuse_confidence;
      const usage_type = row.usage_type;
      const country_name = row.country_name;
      const total_reports = row.total_reports;
      const last_reported_at = row.last_reported_at;
      const checked_at = row.checked_at;

      const severity = severity_from_abuse_score(abuse_confidence);
      
      const details = {
        abuse_confidence,
        usage_type,
        country_name,
        total_reports,
        last_reported_at,
        checked_at,
        threshold: abuse_threshold,
      };

      await upsert_alert_tx(client, {
        alert_type: "BLACKLISTED_IP",
        ip_address,
        severity,
        details,
      });

      ip_rep_upserts += 1;
    }

    await client.query("COMMIT");

    return {
      failed_login_bursts: failed_upserts,
      blacklisted_ips: ip_rep_upserts,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function get_stored_alerts({ limit = 100 } = {}) {
  const sql = `
    SELECT
      a.id,
      a.alert_type,
      a.ip_address,
      a.severity,
      a.details,
      a.created_at,
      at.name AS alert_type_name,
      at.description AS alert_description,
      at.recommended_action,
      at.category
    FROM alerts a
    LEFT JOIN alert_types at ON a.alert_type = at.alert_code
    ORDER BY a.created_at DESC
    LIMIT $1
  `;
  const res = await pool.query(sql, [limit]);
  return res.rows;
}

async function upsert_alert_tx(client, { alert_type, ip_address, severity, details }) {
  const sql = `
    INSERT INTO alerts (alert_type, ip_address, severity, details, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (alert_type, ip_address)
    DO UPDATE SET
      severity = EXCLUDED.severity,
      details = EXCLUDED.details,
      created_at = NOW()
  `;
  await client.query(sql, [
    String(alert_type),
    String(ip_address),
    String(severity),
    details,
  ]);
}

function severity_from_failed_count(failed_count) {
  if (failed_count >= 20) return "HIGH";
  if (failed_count >= 10) return "MEDIUM";
  return "LOW";
}

function severity_from_abuse_score(abuse_score) {
  if (abuse_score >= 80) return "HIGH";
  if (abuse_score >= 50) return "MEDIUM";
  return "LOW";
}

module.exports = {
  refresh_alerts_from_sources,
  get_stored_alerts,
};