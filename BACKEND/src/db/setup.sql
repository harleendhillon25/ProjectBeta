

CREATE TABLE IF NOT EXISTS client_logs (
  id BIGSERIAL PRIMARY KEY,
  client_id INT NOT NULL,
  event_type TEXT NOT NULL, 
  user_id TEXT NOT NULL,             -- LOGIN_SUCCESS, LOGIN_FAILURE, PAGE_VIEW, etc.
  log_date_time TIMESTAMPTZ NOT NULL,
  ip_address TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CREATE INDEX IF NOT EXISTS idx_client_logs_datetime
--   ON client_logs (log_date_time);

-- CREATE INDEX IF NOT EXISTS idx_client_logs_ip_datetime
--   ON client_logs (ipAddress, log_date_time);

CREATE TABLE IF NOT EXISTS ip_reputation (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  abuse_confidence INT NOT NULL,         -- 0-100
  usage_type TEXT,
  country_name TEXT,
  total_reports INT,
  last_reported_at TIMESTAMPTZ,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- You’ll almost always query "latest rep for an IP"
-- CREATE INDEX IF NOT EXISTS idx_iprep_ip_checked
--   ON ip_reputation (ip_address, checked_at DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_type TEXT NOT NULL,              -- BLACKLIST_IP, FAILED_LOGINS
  ip_address TEXT NOT NULL,
  severity TEXT NOT NULL,               -- low | medium | high
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (alert_type, ip_address)  -- Ensure one alert per type/IP for upserts
);

-- CREATE INDEX IF NOT EXISTS idx_alerts_created
--   ON alerts (created_at DESC);

-- CREATE INDEX IF NOT EXISTS idx_alerts_ip
--   ON alerts (ip_address);