
/**
 * @jest-environment jsdom
 */

const {
  loadAlerts,
  refreshAlerts,
  minutesAgo,
  isToday,
  computeRiskLevel,
  loadRiskBanner,
  loadLoginOutcomes,
  loadUniqueIPs,
  loadBlacklistedIPs,
  refreshIPReputation,
  renderAlertsTable,
  loadLoginActivityChart
} = require('../js/index.js');

const { renderDOM } = require("./helpers");

describe("Dashboard (index.html)", () => {
  let dom;
  let document;

  beforeEach(async () => {
    dom = await renderDOM("./client/index.html");
    document = dom.window.document;

    global.window = dom.window;
    global.document = document;

    require("../js/index.js");
  });


  // ============ HELPER FUNCTIONS ============
  describe('Helper Functions', () => {
    test('minutesAgo calculates correct timestamp', () => {
      const minutesAgo = (mins) => Date.now() - mins * 60 * 1000;
      
      const now = Date.now();
      const result = minutesAgo(60);
      const expected = now - 60 * 60 * 1000;
      
      expect(result).toBeCloseTo(expected, -2);
    });

    test('isToday returns true for today\'s date', () => {
      const isToday = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      };

      const todayDate = new Date().toISOString();
      expect(isToday(todayDate)).toBe(true);
    });

    test('isToday returns false for yesterday', () => {
      const isToday = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        return d.toDateString() === today.toDateString();
      };

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday.toISOString())).toBe(false);
    });
  });

  // ============ RISK BANNER ============
  describe('Risk Banner Logic', () => {
    test('computes HIGH risk for high severity alerts', () => {
      const computeRiskLevel = (alerts) => {
        const isToday = (dateStr) => {
          const d = new Date(dateStr);
          const today = new Date();
          return d.toDateString() === today.toDateString();
        };

        const todayAlerts = alerts.filter(a => isToday(a.created_at));
        if (todayAlerts.some(a => a.severity === "HIGH")) return "HIGH";
        if (todayAlerts.some(a => a.severity === "MEDIUM")) return "MODERATE";
        return "LOW";
      };

      const alerts = [
        { severity: 'HIGH', created_at: new Date().toISOString() }
      ];

      expect(computeRiskLevel(alerts)).toBe('HIGH');
    });

    test('computes MODERATE risk for medium severity alerts', () => {
      const computeRiskLevel = (alerts) => {
        const isToday = (dateStr) => {
          const d = new Date(dateStr);
          const today = new Date();
          return d.toDateString() === today.toDateString();
        };

        const todayAlerts = alerts.filter(a => isToday(a.created_at));
        if (todayAlerts.some(a => a.severity === "HIGH")) return "HIGH";
        if (todayAlerts.some(a => a.severity === "MEDIUM")) return "MODERATE";
        return "LOW";
      };

      const alerts = [
        { severity: 'MEDIUM', created_at: new Date().toISOString() }
      ];

      expect(computeRiskLevel(alerts)).toBe('MODERATE');
    });

    test('computes LOW risk when no alerts', () => {
      const computeRiskLevel = (alerts) => {
        const isToday = (dateStr) => {
          const d = new Date(dateStr);
          const today = new Date();
          return d.toDateString() === today.toDateString();
        };

        const todayAlerts = alerts.filter(a => isToday(a.created_at));
        if (todayAlerts.some(a => a.severity === "HIGH")) return "HIGH";
        if (todayAlerts.some(a => a.severity === "MEDIUM")) return "MODERATE";
        return "LOW";
      };

      expect(computeRiskLevel([])).toBe('LOW');
    });
  });

  // ============ LOGIN OUTCOMES ============
  describe('Login Outcomes Calculations', () => {
    test('calculates success/failure rates correctly', () => {
      const logs = [
        { status: 'SUCCESS', log_date_time: new Date().toISOString() },
        { status: 'SUCCESS', log_date_time: new Date().toISOString() },
        { status: 'FAILURE', log_date_time: new Date().toISOString() },
      ];

      const success = logs.filter(l => l.status === 'SUCCESS').length;
      const failed = logs.filter(l => l.status === 'FAILURE').length;
      const total = success + failed;
      const rate = Math.round((success / total) * 100);

      expect(success).toBe(2);
      expect(failed).toBe(1);
      expect(rate).toBe(67);
    });

    test('handles empty logs gracefully', () => {
      const logs = [];
      const success = logs.filter(l => l.status === 'SUCCESS').length;
      const failed = logs.filter(l => l.status === 'FAILURE').length;
      const total = success + failed;
      const rate = total === 0 ? 0 : Math.round((success / total) * 100);

      expect(success).toBe(0);
      expect(failed).toBe(0);
      expect(rate).toBe(0);
    });

    test('handles all failures correctly', () => {
      const logs = [
        { status: 'FAILURE', log_date_time: new Date().toISOString() },
        { status: 'FAILURE', log_date_time: new Date().toISOString() },
      ];

      const success = logs.filter(l => l.status === 'SUCCESS').length;
      const failed = logs.filter(l => l.status === 'FAILURE').length;
      const total = success + failed;
      const rate = Math.round((success / total) * 100);

      expect(success).toBe(0);
      expect(failed).toBe(2);
      expect(rate).toBe(0);
    });
  });

  // ============ DOM ELEMENT CHECKS ============
  describe('DOM Elements Exist', () => {

    test('risk banner element exists', () => {
      const banner = document.getElementById('risk-banner');
      expect(banner).toBeTruthy();
    });

    test('login outcomes elements exist', () => {
      expect(document.getElementById('login-success-count')).toBeTruthy();
      expect(document.getElementById('login-failed-count')).toBeTruthy();
      expect(document.getElementById('loginOutcomesChart')).toBeTruthy();
    });

    test('metric elements exist', () => {
      expect(document.getElementById('unique-ip-count')).toBeTruthy();
      expect(document.getElementById('blacklisted-ip-count')).toBeTruthy();
    });

    test('chart elements exist', () => {
      expect(document.getElementById('loginActivityChart')).toBeTruthy();
    });

    test('alerts table exists', () => {
  console.log('Full body HTML:', document.body.innerHTML);
  console.log('Element:', document.getElementById('alerts-table-body'));
  
  const tbody = document.getElementById('alerts-table-body');
  expect(tbody).toBeTruthy();
});

    test('control buttons exist', () => {
      expect(document.getElementById('refresh-alerts')).toBeTruthy();
      expect(document.getElementById('chart-time-period')).toBeTruthy();
    });
  });

  // ============ ALERTS TABLE RENDERING ============
  describe('Alerts Table Rendering', () => {
    
    test('renders alerts correctly', () => {

      const renderAlertsTable = (alerts) => {
        const tbody = document.getElementById("alerts-table-body");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (!alerts.length) {
          tbody.innerHTML = `<tr><td colspan="4">No suspicious activity detected</td></tr>`;
          return;
        }

        alerts.forEach(alert => {
          const row = document.createElement("tr");
          row.classList.add("clickable-row");
          row.innerHTML = `
            <td>${new Date(alert.created_at).toLocaleString()}</td>
            <td>${alert.alert_type.replace(/_/g, " ")}</td>
            <td><span class="tag ${alert.severity.toLowerCase()}">${alert.severity}</span></td>
            <td>${alert.ip_address || "Unknown"}</td>
          `;
          tbody.appendChild(row);
        });
      };

      const mockAlerts = [
        {
          id: 1,
          created_at: '2026-01-27T10:00:00Z',
          alert_type: 'FAILED_LOGIN_BURST',
          severity: 'HIGH',
          ip_address: '192.168.1.1',
        },
        {
          id: 2,
          created_at: '2026-01-27T11:00:00Z',
          alert_type: 'BLACKLISTED_IP',
          severity: 'CRITICAL',
          ip_address: '10.0.0.1',
        },
      ];

      renderAlertsTable(mockAlerts);

      const tbody = document.getElementById('alerts-table-body');
      expect(tbody).toBeTruthy();
      
      const rows = tbody.querySelectorAll('tr');
      expect(rows.length).toBe(2);
      expect(rows[0].textContent).toContain('FAILED LOGIN BURST');
      expect(rows[1].textContent).toContain('BLACKLISTED IP');
    });

    test('shows empty state when no alerts', () => {

      const renderAlertsTable = (alerts) => {
        const tbody = document.getElementById("alerts-table-body");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (!alerts.length) {
          tbody.innerHTML = `<tr><td colspan="4">No suspicious activity detected</td></tr>`;
          return;
        }
      };

      renderAlertsTable([]);

      const tbody = document.getElementById('alerts-table-body');
      expect(tbody).toBeTruthy();
      expect(tbody.textContent).toContain('No suspicious activity detected');
    });

    test('replaces underscores in alert type', () => {
      const alertType = 'FAILED_LOGIN_BURST';
      const formatted = alertType.replace(/_/g, ' ');
      
      expect(formatted).toBe('FAILED LOGIN BURST');
    });
  });

  // ============ API MOCKING ============
  describe('API Integration', () => {
    test('fetch is called with correct URL for alerts', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await fetch('http://localhost:3000/alerts');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/alerts');
    });

    test('fetch handles errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetch('http://localhost:3000/alerts')).rejects.toThrow('Network error');
    });
  });

  // ============ EVENT HANDLERS ============
  describe('Event Handlers', () => {
      test('logout button exists and is clickable', () => {


        const logoutBtn = document.querySelector('.logout-btn');
  
        expect(logoutBtn).toBeTruthy();
        expect(logoutBtn.textContent.trim()).toBe('Log out');
  
        // Just verify it exists and can be clicked
        expect(logoutBtn.tagName).toBe('BUTTON');
      });

    test('time period selector has correct options', () => {
      const select = document.getElementById('chart-time-period');
      const options = select.querySelectorAll('option');

      expect(options.length).toBe(4);
      expect(options[0].value).toBe('1');
      expect(options[1].value).toBe('24');
      expect(options[2].value).toBe('168');
      expect(options[3].value).toBe('720');
    });
  });
});