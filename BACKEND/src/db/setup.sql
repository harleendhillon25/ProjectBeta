DROP TABLE IF EXISTS client_logs CASCADE;
DROP TABLE IF EXISTS alert_types CASCADE;

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

-- MOCK DATA INSERTION --
INSERT INTO client_logs (
  client_id,
  event_type,
  user_id,
  log_date_time,
  ip_address,
  status
)
VALUES
-- SUCCESSFUL LOGINS (mix of normal and suspicious IPs)
(1, 'LOGIN_ATTEMPT', 'user_1',  NOW() - interval '58 minutes', '192.168.1.10', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_2',  NOW() - interval '55 minutes', '192.168.1.11', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_3',  NOW() - interval '52 minutes', '192.168.1.12', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_4',  NOW() - interval '49 minutes', '144.2.125.115', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_5',  NOW() - interval '46 minutes', '192.168.1.14', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_6',  NOW() - interval '43 minutes', '192.168.1.15', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_7',  NOW() - interval '40 minutes', '23.180.120.131', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_8',  NOW() - interval '38 minutes', '192.168.1.17', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_9',  NOW() - interval '36 minutes', '192.168.1.18', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_10', NOW() - interval '34 minutes', '192.168.1.19', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_11', NOW() - interval '32 minutes', '96.248.32.65', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_12', NOW() - interval '30 minutes', '192.168.1.21', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_13', NOW() - interval '28 minutes', '192.168.1.22', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_14', NOW() - interval '26 minutes', '23.132.164.238', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_15', NOW() - interval '24 minutes', '192.168.1.24', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_16', NOW() - interval '22 minutes', '192.168.1.25', 'SUCCESS'),
(1, 'LOGIN_ATTEMPT', 'user_17', NOW() - interval '20 minutes', '115.96.204.73', 'SUCCESS'),

-- FAILED LOGINS (concentrated on suspicious IPs)
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '57 minutes', '144.2.125.115', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '56 minutes', '144.2.125.115', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'root',    NOW() - interval '55 minutes', '144.2.125.115', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '54 minutes', '144.2.125.115', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'user_21', NOW() - interval '50 minutes', '192.168.1.30', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '48 minutes', '23.180.120.131', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'root',    NOW() - interval '47 minutes', '23.180.120.131', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '46 minutes', '23.180.120.131', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '45 minutes', '23.180.120.131', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'user_22', NOW() - interval '42 minutes', '192.168.1.31', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '39 minutes', '96.248.32.65', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'root',    NOW() - interval '38 minutes', '96.248.32.65', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '37 minutes', '96.248.32.65', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '35 minutes', '23.132.164.238', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'root',    NOW() - interval '34 minutes', '23.132.164.238', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '33 minutes', '115.96.204.73', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'root',    NOW() - interval '32 minutes', '115.96.204.73', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '31 minutes', '121.237.10.107', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'root',    NOW() - interval '30 minutes', '121.237.10.107', 'FAILURE'),
(1, 'LOGIN_ATTEMPT', 'admin',   NOW() - interval '29 minutes', '121.237.10.107', 'FAILURE');

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
  client_id INT NOT NULL,
  alert_type TEXT NOT NULL,              -- BLACKLISTED_IP, FAILED_LOGINS
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

CREATE TABLE IF NOT EXISTS clients (
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

('FAILED_LOGIN_BURST', 'Failed Login Burst', 'Multiple failed login attempts from single IP in short time period', 'HIGH', 'Authentication', E'Check which account was targeted and reset the password as a precaution\n Turn on two-factor authentication (2FA) if it is not already enabled\n Monitor sign-in activity for the next 24 hours'),

('BRUTE_FORCE_ATTACK', 'Brute Force Attack', 'Systematic password guessing attempts detected across multiple accounts', 'HIGH', 'Authentication', E'Enable two-factor authentication for all users, especially admin accounts\n Make sure passwords are strong and not reused elsewhere\n Monitor login activity closely over the next day'
),

('ACCOUNT_TAKEOVER', 'Account Takeover', 'Suspicious account activity indicating potential compromise', 'HIGH', 'Authentication', E'Lock the account and reset the password immediately\n Enable two-factor authentication before re-enabling access\n Contact the user to confirm whether the activity was expected'
),

('BLACKLISTED_IP', 'Blacklisted IP', 'Connection from known malicious IP address (AbuseIPDB score >= 50)', 'HIGH', 'Network', E'If you use a hosting provider or service like Cloudflare, look for “IP blocking” or “security rules” and block this IP\n Review recent sign-in activity to confirm no accounts were accessed\n If you are unsure how to block an IP, contact your hosting provider or follow their security guide'
)

ON CONFLICT (alert_code) DO NOTHING;

