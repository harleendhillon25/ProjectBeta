

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
  ip_address TEXT NOT NULL UNIQUE,
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

CREATE TABLE clients (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create alert_types table
CREATE TABLE IF NOT EXISTS alert_types (
  id SERIAL PRIMARY KEY,
  alert_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  category VARCHAR(50) NOT NULL,
  recommended_action TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert 4 essential alert types
INSERT INTO alert_types (alert_code, name, description, severity, category, recommended_action) VALUES

('FAILED_LOGIN_BURST', 'Failed Login Burst', 'Multiple failed login attempts from single IP in short time period', 'HIGH', 'Authentication', 'Block IP address, enable CAPTCHA, review authentication logs'),

('BRUTE_FORCE_ATTACK', 'Brute Force Attack', 'Systematic password guessing attempts detected across multiple accounts', 'CRITICAL', 'Authentication', 'Block IP immediately, enable rate limiting, force password resets'),

('ACCOUNT_TAKEOVER', 'Account Takeover', 'Suspicious account activity indicating potential compromise', 'CRITICAL', 'Authentication', 'Lock account immediately, notify user, force credential reset'),

('BLACKLISTED_IP', 'Blacklisted IP', 'Connection from known malicious IP address (AbuseIPDB score >= 50)', 'HIGH', 'Network', 'Block IP at firewall level, review all recent activity from this IP');