

CREATE TABLE IF NOT EXISTS client_logs (
  id BIGSERIAL PRIMARY KEY,
  logDateTime TIMESTAMPTZ NOT NULL,
  ipAddress TEXT NOT NULL,
  status TEXT NOT NULL
);

-- CREATE INDEX IF NOT EXISTS idx_client_logs_datetime
--   ON client_logs (logDateTime);

-- CREATE INDEX IF NOT EXISTS idx_client_logs_ip_datetime
--   ON client_logs (ipAddress, logDateTime);

CREATE TABLE IF NOT EXISTS ip_reputation (
  id BIGSERIAL PRIMARY KEY,
  ipAddress TEXT NOT NULL,
  abuseConfidence INT NOT NULL,         -- 0-100
  usageType TEXT,
  countryName TEXT,
  totalReports INT,
  lastReportedAt TIMESTAMPTZ,
  checkedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- You’ll almost always query "latest rep for an IP"
-- CREATE INDEX IF NOT EXISTS idx_iprep_ip_checked
--   ON ip_reputation (ipAddress, checkedAt DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  alertType TEXT NOT NULL,              -- BLACKLIST_IP, FAILED_LOGINS
  ipAddress TEXT NOT NULL,
  severity TEXT NOT NULL,               -- low | medium | high
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CREATE INDEX IF NOT EXISTS idx_alerts_created
--   ON alerts (createdAt DESC);

-- CREATE INDEX IF NOT EXISTS idx_alerts_ip
--   ON alerts (ipAddress);