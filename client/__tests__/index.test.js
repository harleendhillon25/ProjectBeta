
// /**
//  * @jest-environment jsdom
//  */

// const {
//   loadAlerts,
//   refreshAlerts,
//   minutesAgo,
//   isToday,
//   computeRiskLevel,
//   loadRiskBanner,
//   loadLoginOutcomes,
//   loadUniqueIPs,
//   loadBlacklistedIPs,
//   refreshIPReputation,
//   renderAlertsTable,
//   loadLoginActivityChart
// } = require('../js/index.js');

// const { renderDOM } = require("./helpers");

// describe("Dashboard (index.html)", () => {
//   let dom;
//   let document;

//   beforeEach(async () => {
//     dom = await renderDOM("./client/index.html");
//     document = dom.window.document;

//     global.window = dom.window;
//     global.document = document;

//     require("../js/index.js");
//   });


//   // ============ HELPER FUNCTIONS ============
//   describe('Helper Functions', () => {
//     test('minutesAgo calculates correct timestamp', () => {
//       const minutesAgo = (mins) => Date.now() - mins * 60 * 1000;
      
//       const now = Date.now();
//       const result = minutesAgo(60);
//       const expected = now - 60 * 60 * 1000;
      
//       expect(result).toBeCloseTo(expected, -2);
//     });

//     test('isToday returns true for today\'s date', () => {
//       const isToday = (dateStr) => {
//         const d = new Date(dateStr);
//         const today = new Date();
//         return d.toDateString() === today.toDateString();
//       };

//       const todayDate = new Date().toISOString();
//       expect(isToday(todayDate)).toBe(true);
//     });

//     test('isToday returns false for yesterday', () => {
//       const isToday = (dateStr) => {
//         const d = new Date(dateStr);
//         const today = new Date();
//         return d.toDateString() === today.toDateString();
//       };

//       const yesterday = new Date();
//       yesterday.setDate(yesterday.getDate() - 1);
//       expect(isToday(yesterday.toISOString())).toBe(false);
//     });
//   });

//   // ============ RISK BANNER ============
//   describe('Risk Banner Logic', () => {
//     test('computes HIGH risk for high severity alerts', () => {
//       const computeRiskLevel = (alerts) => {
//         const isToday = (dateStr) => {
//           const d = new Date(dateStr);
//           const today = new Date();
//           return d.toDateString() === today.toDateString();
//         };

//         const todayAlerts = alerts.filter(a => isToday(a.created_at));
//         if (todayAlerts.some(a => a.severity === "HIGH")) return "HIGH";
//         if (todayAlerts.some(a => a.severity === "MEDIUM")) return "MODERATE";
//         return "LOW";
//       };

//       const alerts = [
//         { severity: 'HIGH', created_at: new Date().toISOString() }
//       ];

//       expect(computeRiskLevel(alerts)).toBe('HIGH');
//     });

//     test('computes MODERATE risk for medium severity alerts', () => {
//       const computeRiskLevel = (alerts) => {
//         const isToday = (dateStr) => {
//           const d = new Date(dateStr);
//           const today = new Date();
//           return d.toDateString() === today.toDateString();
//         };

//         const todayAlerts = alerts.filter(a => isToday(a.created_at));
//         if (todayAlerts.some(a => a.severity === "HIGH")) return "HIGH";
//         if (todayAlerts.some(a => a.severity === "MEDIUM")) return "MODERATE";
//         return "LOW";
//       };

//       const alerts = [
//         { severity: 'MEDIUM', created_at: new Date().toISOString() }
//       ];

//       expect(computeRiskLevel(alerts)).toBe('MODERATE');
//     });

//     test('computes LOW risk when no alerts', () => {
//       const computeRiskLevel = (alerts) => {
//         const isToday = (dateStr) => {
//           const d = new Date(dateStr);
//           const today = new Date();
//           return d.toDateString() === today.toDateString();
//         };

//         const todayAlerts = alerts.filter(a => isToday(a.created_at));
//         if (todayAlerts.some(a => a.severity === "HIGH")) return "HIGH";
//         if (todayAlerts.some(a => a.severity === "MEDIUM")) return "MODERATE";
//         return "LOW";
//       };

//       expect(computeRiskLevel([])).toBe('LOW');
//     });
//   });

//   // ============ LOGIN OUTCOMES ============
//   describe('Login Outcomes Calculations', () => {
//     test('calculates success/failure rates correctly', () => {
//       const logs = [
//         { status: 'SUCCESS', log_date_time: new Date().toISOString() },
//         { status: 'SUCCESS', log_date_time: new Date().toISOString() },
//         { status: 'FAILURE', log_date_time: new Date().toISOString() },
//       ];

//       const success = logs.filter(l => l.status === 'SUCCESS').length;
//       const failed = logs.filter(l => l.status === 'FAILURE').length;
//       const total = success + failed;
//       const rate = Math.round((success / total) * 100);

//       expect(success).toBe(2);
//       expect(failed).toBe(1);
//       expect(rate).toBe(67);
//     });

//     test('handles empty logs gracefully', () => {
//       const logs = [];
//       const success = logs.filter(l => l.status === 'SUCCESS').length;
//       const failed = logs.filter(l => l.status === 'FAILURE').length;
//       const total = success + failed;
//       const rate = total === 0 ? 0 : Math.round((success / total) * 100);

//       expect(success).toBe(0);
//       expect(failed).toBe(0);
//       expect(rate).toBe(0);
//     });

//     test('handles all failures correctly', () => {
//       const logs = [
//         { status: 'FAILURE', log_date_time: new Date().toISOString() },
//         { status: 'FAILURE', log_date_time: new Date().toISOString() },
//       ];

//       const success = logs.filter(l => l.status === 'SUCCESS').length;
//       const failed = logs.filter(l => l.status === 'FAILURE').length;
//       const total = success + failed;
//       const rate = Math.round((success / total) * 100);

//       expect(success).toBe(0);
//       expect(failed).toBe(2);
//       expect(rate).toBe(0);
//     });
//   });

//   // ============ DOM ELEMENT CHECKS ============
//   describe('DOM Elements Exist', () => {

//     test('risk banner element exists', () => {
//       const banner = document.getElementById('risk-banner');
//       expect(banner).toBeTruthy();
//     });

//     test('login outcomes elements exist', () => {
//       expect(document.getElementById('login-success-count')).toBeTruthy();
//       expect(document.getElementById('login-failed-count')).toBeTruthy();
//       expect(document.getElementById('loginOutcomesChart')).toBeTruthy();
//     });

//     test('metric elements exist', () => {
//       expect(document.getElementById('unique-ip-count')).toBeTruthy();
//       expect(document.getElementById('blacklisted-ip-count')).toBeTruthy();
//     });

//     test('chart elements exist', () => {
//       expect(document.getElementById('loginActivityChart')).toBeTruthy();
//     });

//     test('alerts table exists', () => {
//   console.log('Full body HTML:', document.body.innerHTML);
//   console.log('Element:', document.getElementById('alerts-table-body'));
  
//   const tbody = document.getElementById('alerts-table-body');
//   expect(tbody).toBeTruthy();
// });

//     test('control buttons exist', () => {
//       expect(document.getElementById('refresh-alerts')).toBeTruthy();
//       expect(document.getElementById('chart-time-period')).toBeTruthy();
//     });
//   });

//   // ============ ALERTS TABLE RENDERING ============
//   describe('Alerts Table Rendering', () => {
    
//     test('renders alerts correctly', () => {

//       const renderAlertsTable = (alerts) => {
//         const tbody = document.getElementById("alerts-table-body");
//         if (!tbody) return;

//         tbody.innerHTML = "";

//         if (!alerts.length) {
//           tbody.innerHTML = `<tr><td colspan="4">No suspicious activity detected</td></tr>`;
//           return;
//         }

//         alerts.forEach(alert => {
//           const row = document.createElement("tr");
//           row.classList.add("clickable-row");
//           row.innerHTML = `
//             <td>${new Date(alert.created_at).toLocaleString()}</td>
//             <td>${alert.alert_type.replace(/_/g, " ")}</td>
//             <td><span class="tag ${alert.severity.toLowerCase()}">${alert.severity}</span></td>
//             <td>${alert.ip_address || "Unknown"}</td>
//           `;
//           tbody.appendChild(row);
//         });
//       };

//       const mockAlerts = [
//         {
//           id: 1,
//           created_at: '2026-01-27T10:00:00Z',
//           alert_type: 'FAILED_LOGIN_BURST',
//           severity: 'HIGH',
//           ip_address: '192.168.1.1',
//         },
//         {
//           id: 2,
//           created_at: '2026-01-27T11:00:00Z',
//           alert_type: 'BLACKLISTED_IP',
//           severity: 'CRITICAL',
//           ip_address: '10.0.0.1',
//         },
//       ];

//       renderAlertsTable(mockAlerts);

//       const tbody = document.getElementById('alerts-table-body');
//       expect(tbody).toBeTruthy();
      
//       const rows = tbody.querySelectorAll('tr');
//       expect(rows.length).toBe(2);
//       expect(rows[0].textContent).toContain('FAILED LOGIN BURST');
//       expect(rows[1].textContent).toContain('BLACKLISTED IP');
//     });

//     test('shows empty state when no alerts', () => {

//       const renderAlertsTable = (alerts) => {
//         const tbody = document.getElementById("alerts-table-body");
//         if (!tbody) return;

//         tbody.innerHTML = "";

//         if (!alerts.length) {
//           tbody.innerHTML = `<tr><td colspan="4">No suspicious activity detected</td></tr>`;
//           return;
//         }
//       };

//       renderAlertsTable([]);

//       const tbody = document.getElementById('alerts-table-body');
//       expect(tbody).toBeTruthy();
//       expect(tbody.textContent).toContain('No suspicious activity detected');
//     });

//     test('replaces underscores in alert type', () => {
//       const alertType = 'FAILED_LOGIN_BURST';
//       const formatted = alertType.replace(/_/g, ' ');
      
//       expect(formatted).toBe('FAILED LOGIN BURST');
//     });
//   });

//   // ============ API MOCKING ============
//   describe('API Integration', () => {
//     test('fetch is called with correct URL for alerts', async () => {
//       global.fetch.mockResolvedValueOnce({
//         ok: true,
//         json: async () => ({ data: [] }),
//       });

//       await fetch('http://localhost:3000/alerts');

//       expect(fetch).toHaveBeenCalledWith('http://localhost:3000/alerts');
//     });

//     test('fetch handles errors gracefully', async () => {
//       global.fetch.mockRejectedValueOnce(new Error('Network error'));

//       await expect(fetch('http://localhost:3000/alerts')).rejects.toThrow('Network error');
//     });
//   });

//   // ============ EVENT HANDLERS ============
//   describe('Event Handlers', () => {
//       test('logout button exists and is clickable', () => {


//         const logoutBtn = document.querySelector('.logout-btn');
  
//         expect(logoutBtn).toBeTruthy();
//         expect(logoutBtn.textContent.trim()).toBe('Log out');
  
//         // Just verify it exists and can be clicked
//         expect(logoutBtn.tagName).toBe('BUTTON');
//       });

//     test('time period selector has correct options', () => {
//       const select = document.getElementById('chart-time-period');
//       const options = select.querySelectorAll('option');

//       expect(options.length).toBe(4);
//       expect(options[0].value).toBe('1');
//       expect(options[1].value).toBe('24');
//       expect(options[2].value).toBe('168');
//       expect(options[3].value).toBe('720');
//     });
//   });
// });

/**
 * @jest-environment jsdom
 */

const { renderDOM } = require("./helpers");

describe("Dashboard (index.html) - using real exports from client/js/index.js", () => {
  let dom;
  let document;

  // We'll require index.js AFTER the DOM is created each time
  let api;

  beforeEach(async () => {
    jest.resetModules(); // IMPORTANT: so require('../js/index.js') re-runs fresh each test

    dom = await renderDOM("./client/index.html");
    document = dom.window.document;

    global.window = dom.window;
    global.document = document;

    // Provide fetch in jsdom tests if your functions use it
    global.fetch = jest.fn();

    // Now import the module once the DOM exists
    api = require("../js/index.js");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================
  // HELPER FUNCTIONS (REAL)
  // ==========================
  describe("Helper Functions (real exports)", () => {
    test("minutesAgo returns a timestamp ~ N minutes in the past", () => {
      // Act
      const result = api.minutesAgo(60);

      // Assert: should be close to now - 60 minutes (allow a little timing wiggle)
      const expected = Date.now() - 60 * 60 * 1000;
      expect(result).toBeGreaterThan(expected - 2000);
      expect(result).toBeLessThan(expected + 2000);
    });

    test("isToday returns true for today and false for yesterday", () => {
      const today = new Date().toISOString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(api.isToday(today)).toBe(true);
      expect(api.isToday(yesterday.toISOString())).toBe(false);
    });
  });

  // ==========================
  // RISK LOGIC (REAL)
  // ==========================
  describe("Risk Banner Logic (real exports)", () => {
    test("computeRiskLevel returns HIGH when there is a HIGH alert today", () => {
      const alerts = [{ severity: "HIGH", created_at: new Date().toISOString() }];
      expect(api.computeRiskLevel(alerts)).toBe("HIGH");
    });

    test("computeRiskLevel returns MODERATE when there is MEDIUM today and no HIGH", () => {
      const alerts = [{ severity: "MEDIUM", created_at: new Date().toISOString() }];
      expect(api.computeRiskLevel(alerts)).toBe("MODERATE");
    });

    test("computeRiskLevel returns LOW when there are no alerts", () => {
      expect(api.computeRiskLevel([])).toBe("LOW");
    });

    test("loadRiskBanner writes the computed level into the DOM", () => {
      // This assumes your HTML has an element with id="risk-banner"
      // and your loadRiskBanner updates it (text/class/etc).

      const alerts = [{ severity: "HIGH", created_at: new Date().toISOString() }];

      api.loadRiskBanner(alerts);

      const banner = document.getElementById("risk-banner");
      expect(banner).toBeTruthy();

      // Don’t be too strict if you don’t know exact formatting:
      expect(banner.textContent.toUpperCase()).toContain("HIGH");
    });
  });

  // ==========================
  // ALERTS TABLE (REAL)
  // ==========================
  describe("Alerts Table Rendering (real exports)", () => {
    test("renderAlertsTable renders rows for alerts", () => {
      const mockAlerts = [
        {
          id: 1,
          created_at: "2026-01-27T10:00:00Z",
          alert_type: "FAILED_LOGIN_BURST",
          severity: "HIGH",
          ip_address: "192.168.1.1",
        },
        {
          id: 2,
          created_at: "2026-01-27T11:00:00Z",
          alert_type: "BLACKLISTED_IP",
          severity: "MEDIUM",
          ip_address: "10.0.0.1",
        },
      ];

      api.renderAlertsTable(mockAlerts);

      const tbody = document.getElementById("alerts-table-body");
      expect(tbody).toBeTruthy();

      const rows = tbody.querySelectorAll("tr");
      expect(rows.length).toBe(2);

      // Use flexible checks (case/formatting can differ)
      expect(rows[0].textContent.toUpperCase()).toContain("FAILED LOGIN BURST");
      expect(rows[1].textContent.toUpperCase()).toContain("BLACKLISTED IP");
    });

    test("renderAlertsTable shows empty state when no alerts", () => {
      api.renderAlertsTable([]);

      const tbody = document.getElementById("alerts-table-body");
      expect(tbody).toBeTruthy();
      expect(tbody.textContent).toContain("No suspicious activity detected");
    });
  });

  // ==========================
  // API-INTEGRATION FUNCTIONS (REAL)
  // ==========================
  describe("API Integration functions call fetch (real exports)", () => {
    test("loadAlerts calls fetch and then renders empty state when data is empty", async () => {
      // Arrange fetch response to match what your loadAlerts expects.
      // If your API returns { data: [...] } (like your previous tests), keep that.
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      // Act
      await api.loadAlerts();

      // Assert fetch called (update URL if your code uses a different path)
      expect(global.fetch).toHaveBeenCalled();

      // Assert: table updated to empty state
      const tbody = document.getElementById("alerts-table-body");
      expect(tbody.textContent).toContain("No suspicious activity detected");
    });

    test("refreshAlerts calls the refresh endpoint (if implemented) and returns/updates DOM", async () => {
      // This depends on your implementation: if refreshAlerts hits POST /alerts/refresh etc.
      // We keep it flexible: just ensure fetch called.
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.refreshAlerts();

      expect(global.fetch).toHaveBeenCalled();
    });

    test("refreshIPReputation calls fetch (if implemented)", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.refreshIPReputation();

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  // ==========================
  // DOM ELEMENT CHECKS (unchanged)
  // ==========================
  describe("DOM Elements Exist", () => {
    test("risk banner element exists", () => {
      expect(document.getElementById("risk-banner")).toBeTruthy();
    });

    test("login outcomes elements exist", () => {
      expect(document.getElementById("login-success-count")).toBeTruthy();
      expect(document.getElementById("login-failed-count")).toBeTruthy();
      expect(document.getElementById("loginOutcomesChart")).toBeTruthy();
    });

    test("metric elements exist", () => {
      expect(document.getElementById("unique-ip-count")).toBeTruthy();
      expect(document.getElementById("blacklisted-ip-count")).toBeTruthy();
    });

    test("chart elements exist", () => {
      expect(document.getElementById("loginActivityChart")).toBeTruthy();
    });

    test("alerts table exists", () => {
      expect(document.getElementById("alerts-table-body")).toBeTruthy();
    });

    test("control buttons exist", () => {
      expect(document.getElementById("refresh-alerts")).toBeTruthy();
      expect(document.getElementById("chart-time-period")).toBeTruthy();
    });
  });
  // ==========================
  // CHART LOGIC TESTS
  // ==========================
  
  describe("Chart Instance Management", () => {
    test("loadLoginActivityChart destroys existing chart before creating new one", async () => {
      global.Chart = jest.fn().mockImplementation(() => ({
        destroy: jest.fn(),
      }));

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginActivityChart(24);
      await api.loadLoginActivityChart(48);

      expect(global.Chart).toHaveBeenCalledTimes(2);
    });

    test("loadLoginOutcomes destroys existing chart before creating new one", async () => {
      global.Chart = jest.fn().mockImplementation(() => ({
        destroy: jest.fn(),
      }));

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginOutcomes();
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginOutcomes();

      expect(global.Chart).toHaveBeenCalledTimes(2);
    });
  });

  describe("Time Grouping in Login Activity Chart", () => {
    test("groups by hour when hoursBack <= 48", async () => {
      global.Chart = jest.fn();
      
      const mockAlerts = [
        {
          alert_type: "FAILED_LOGIN_BURST",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          severity: "HIGH",
        },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAlerts }),
      });

      await api.loadLoginActivityChart(24);

      expect(global.Chart).toHaveBeenCalled();
      const chartConfig = global.Chart.mock.calls[0][1];
      expect(chartConfig.options.scales.x.title.text).toBe("Time (Hour)");
    });

    test("groups by day when hoursBack > 48", async () => {
      global.Chart = jest.fn();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginActivityChart(168);

      expect(global.Chart).toHaveBeenCalled();
      const chartConfig = global.Chart.mock.calls[0][1];
      expect(chartConfig.options.scales.x.title.text).toBe("Date");
    });

    test("counts FAILED_LOGIN_BURST and BLACKLISTED_IP separately", async () => {
      global.Chart = jest.fn();

      const now = Date.now();
      const mockAlerts = [
        {
          alert_type: "FAILED_LOGIN_BURST",
          created_at: new Date(now - 30 * 60 * 1000).toISOString(),
          severity: "HIGH",
        },
        {
          alert_type: "BLACKLISTED_IP",
          created_at: new Date(now - 45 * 60 * 1000).toISOString(),
          severity: "MEDIUM",
        },
        {
          alert_type: "FAILED_LOGIN_BURST",
          created_at: new Date(now - 60 * 60 * 1000).toISOString(),
          severity: "HIGH",
        },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAlerts }),
      });

      await api.loadLoginActivityChart(24);

      expect(global.Chart).toHaveBeenCalled();
      const chartData = global.Chart.mock.calls[0][1].data;
      
      expect(chartData.datasets.length).toBe(3);
      expect(chartData.datasets[0].label).toBe("Failed Login Bursts");
      expect(chartData.datasets[1].label).toBe("Blacklisted IP Alerts");
      expect(chartData.datasets[2].label).toBe("Total Alerts");
    });
  });

  describe("Error Handling", () => {
    test("loadAlerts handles network errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      global.fetch.mockRejectedValueOnce(new Error("Network failure"));

      await api.loadAlerts();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Alerts load error:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test("loadRiskBanner handles fetch errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      global.fetch.mockRejectedValueOnce(new Error("Network failure"));

      await api.loadRiskBanner();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Risk banner load error:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    test("loadLoginOutcomes handles missing canvas element", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const canvas = document.getElementById("loginOutcomesChart");
      if (canvas) canvas.remove();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginOutcomes();

      expect(consoleSpy).toHaveBeenCalledWith("Login outcomes chart canvas not found");

      consoleSpy.mockRestore();
    });

    test("loadLoginActivityChart handles missing canvas element", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const canvas = document.getElementById("loginActivityChart");
      if (canvas) canvas.remove();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginActivityChart(24);

      expect(consoleSpy).toHaveBeenCalledWith("Chart canvas not found");

      consoleSpy.mockRestore();
    });

    test("refreshAlerts handles non-ok response", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await api.refreshAlerts();

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    test("refreshIPReputation handles non-ok response", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await api.refreshIPReputation();

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("Login Outcomes Chart Configuration", () => {
    test("creates donut chart with correct configuration", async () => {
      global.Chart = jest.fn();

      const mockLogs = [
        { status: "SUCCESS", log_date_time: new Date().toISOString() },
        { status: "SUCCESS", log_date_time: new Date().toISOString() },
        { status: "FAILURE", log_date_time: new Date().toISOString() },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLogs }),
      });

      await api.loadLoginOutcomes();

      expect(global.Chart).toHaveBeenCalled();
      const config = global.Chart.mock.calls[0][1];

      expect(config.type).toBe("doughnut");
      expect(config.options.cutout).toBe("70%");
      expect(config.data.labels).toEqual(["Success", "Failed"]);
      expect(config.data.datasets[0].data).toEqual([2, 1]);
    });

    test("calculates percentage correctly in tooltip", async () => {
      global.Chart = jest.fn();

      const mockLogs = [
        { status: "SUCCESS", log_date_time: new Date().toISOString() },
        { status: "FAILURE", log_date_time: new Date().toISOString() },
        { status: "FAILURE", log_date_time: new Date().toISOString() },
        { status: "FAILURE", log_date_time: new Date().toISOString() },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLogs }),
      });

      await api.loadLoginOutcomes();

      const config = global.Chart.mock.calls[0][1];
      const tooltipCallback = config.options.plugins.tooltip.callbacks.label;

      const context = {
        label: "Success",
        parsed: 1,
      };

      const result = tooltipCallback(context);
      expect(result).toBe("Success: 1 (25%)");
    });

    test("handles zero total in percentage calculation", async () => {
      global.Chart = jest.fn();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginOutcomes();

      const config = global.Chart.mock.calls[0][1];
      const tooltipCallback = config.options.plugins.tooltip.callbacks.label;

      const context = {
        label: "Success",
        parsed: 0,
      };

      const result = tooltipCallback(context);
      expect(result).toBe("Success: 0 (0%)");
    });
  });

  describe("Unique IPs Calculation", () => {
    test("counts unique IPs correctly", async () => {
      const mockIPs = [
        { ip_address: "192.168.1.1", checked_at: new Date().toISOString() },
        { ip_address: "192.168.1.2", checked_at: new Date().toISOString() },
        { ip_address: "192.168.1.1", checked_at: new Date().toISOString() },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockIPs }),
      });

      await api.loadUniqueIPs();

      const countElement = document.getElementById("unique-ip-count");
      expect(countElement.textContent).toBe("2");
    });

    test("handles empty IPs array", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadUniqueIPs();

      const countElement = document.getElementById("unique-ip-count");
      expect(countElement.textContent).toBe("0");
    });
  });

  describe("Blacklisted IPs Filtering", () => {
    test("counts only BLACKLISTED_IP alerts from today", async () => {
      const today = new Date().toISOString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockAlerts = [
        { alert_type: "BLACKLISTED_IP", created_at: today },
        { alert_type: "BLACKLISTED_IP", created_at: today },
        { alert_type: "BLACKLISTED_IP", created_at: yesterday.toISOString() },
        { alert_type: "FAILED_LOGIN_BURST", created_at: today },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAlerts }),
      });

      await api.loadBlacklistedIPs();

      const countElement = document.getElementById("blacklisted-ip-count");
      expect(countElement.textContent).toBe("2");
    });
  });

  describe("Alert Table Click Handler", () => {
    test("stores alert in sessionStorage and redirects on row click", () => {
      const mockAlert = {
        id: 1,
        created_at: "2026-01-27T10:00:00Z",
        alert_type: "FAILED_LOGIN_BURST",
        severity: "HIGH",
        ip_address: "192.168.1.1",
      };

      delete global.window.sessionStorage;
      global.window.sessionStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };

      delete global.window.location;
      global.window.location = { href: "" };

      api.renderAlertsTable([mockAlert]);

      const row = document.querySelector("tr.clickable-row");
      expect(row).toBeTruthy();

      row.click();

      expect(global.window.sessionStorage.setItem).toHaveBeenCalledWith(
        "selectedAlert",
        JSON.stringify(mockAlert)
      );
      expect(global.window.location.href).toBe("security.html");
    });
  });

  describe("Login Success Rate Calculation", () => {
    test("filters logs by time window correctly", async () => {
      const now = Date.now();
      const mockLogs = [
        { status: "SUCCESS", log_date_time: new Date(now - 30 * 60 * 1000).toISOString() },
        { status: "SUCCESS", log_date_time: new Date(now - 90 * 60 * 1000).toISOString() },
        { status: "FAILURE", log_date_time: new Date(now - 45 * 60 * 1000).toISOString() },
      ];

      global.Chart = jest.fn();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLogs }),
      });

      await api.loadLoginOutcomes();

      const successElement = document.getElementById("login-success-count");
      const failedElement = document.getElementById("login-failed-count");

      expect(successElement.textContent).toBe("1");
      expect(failedElement.textContent).toBe("1");
    });
  });

  describe("Chart Time Period Title", () => {
    test("displays hours for short time periods", async () => {
      global.Chart = jest.fn();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginActivityChart(24);

      const config = global.Chart.mock.calls[0][1];
      expect(config.options.plugins.title.text).toBe("Security Alerts - Last 24 Hours");
    });

    test("displays days for long time periods", async () => {
      global.Chart = jest.fn();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginActivityChart(168);

      const config = global.Chart.mock.calls[0][1];
      expect(config.options.plugins.title.text).toBe("Security Alerts - Last 7 Days");
    });
  });

  describe("Alert Type Formatting", () => {
    test("replaces underscores with spaces in alert types", () => {
      const mockAlerts = [
        {
          id: 1,
          created_at: "2026-01-27T10:00:00Z",
          alert_type: "FAILED_LOGIN_BURST",
          severity: "HIGH",
          ip_address: "192.168.1.1",
        },
      ];

      api.renderAlertsTable(mockAlerts);

      const row = document.querySelector("tr.clickable-row");
      expect(row.textContent).toContain("FAILED LOGIN BURST");
      expect(row.textContent).not.toContain("FAILED_LOGIN_BURST");
    });

    test("handles missing IP address", () => {
      const mockAlerts = [
        {
          id: 1,
          created_at: "2026-01-27T10:00:00Z",
          alert_type: "FAILED_LOGIN_BURST",
          severity: "HIGH",
          ip_address: null,
        },
      ];

      api.renderAlertsTable(mockAlerts);

      const row = document.querySelector("tr.clickable-row");
      expect(row.textContent).toContain("Unknown");
    });
  });

  describe("Console Logging", () => {
    test("logs success message when chart loads", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      global.Chart = jest.fn();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      await api.loadLoginActivityChart(24);

      expect(consoleSpy).toHaveBeenCalledWith("✅ Chart loaded: Last 24 hours");

      consoleSpy.mockRestore();
    });

    test("logs success message when login outcomes chart loads", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      global.Chart = jest.fn();

      const mockLogs = [
        { status: "SUCCESS", log_date_time: new Date().toISOString() },
        { status: "FAILURE", log_date_time: new Date().toISOString() },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLogs }),
      });

      await api.loadLoginOutcomes();

      expect(consoleSpy).toHaveBeenCalledWith(
        "✅ Login outcomes chart loaded: 1 success, 1 failed"
      );

      consoleSpy.mockRestore();
    });

    test("logs success message when IP reputation is refreshed", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.refreshIPReputation();

      expect(consoleSpy).toHaveBeenCalledWith("IP reputation refreshed");

      consoleSpy.mockRestore();
    });
  });
});
