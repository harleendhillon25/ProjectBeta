/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

let indexJS;
let html;

beforeAll(() => {
  html = fs.readFileSync(path.resolve(__dirname, "../index.html"), "utf8");
});

beforeEach(() => {
  // Load DOM
  document.documentElement.innerHTML = html;

  // Mock localStorage
  const storage = {};
  jest.spyOn(Storage.prototype, "getItem").mockImplementation((key) => storage[key] || null);
  jest.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
    storage[key] = value;
  });
  jest.spyOn(Storage.prototype, "removeItem").mockImplementation((key) => {
    delete storage[key];
  });

  // Mock fetch
  global.fetch = jest.fn((url, opts) => {
    if (url.endsWith("/alerts")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { created_at: new Date().toISOString(), alert_type: "BLACKLISTED_IP", severity: "MEDIUM", ip_address: "1.1.1.1" }
          ]
        }),
      });
    }
    if (url.endsWith("/alerts/refresh")) {
      return Promise.resolve({ ok: true });
    }
    if (url.endsWith("/logs")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { log_date_time: new Date().toISOString(), status: "SUCCESS" },
            { log_date_time: new Date().toISOString(), status: "FAILURE" },
          ],
        }),
      });
    }
    if (url.endsWith("/ips/refresh")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { ip_address: "1.1.1.1" },
            { ip_address: "2.2.2.2" },
          ],
        }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) });
  });

  // Mock window.location safely
  delete window.location;
  window.location = { pathname: "/index.html", href: "" };

  // Mock Chart
  class ChartMock {
    constructor() { this.destroy = jest.fn(); }
  }
  global.Chart = ChartMock;

  jest.isolateModules(() => {
    indexJS = require("../js/index.js");
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.resetModules();
});

describe("Dashboard Tests", () => {
  test("Logout button removes token", () => {
    const logoutBtn = document.querySelector(".logout-btn");
    logoutBtn.click();
    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
  });

  test("Sidebar highlights active link", () => {
    document.querySelectorAll(".sidebar a").forEach(link => {
      if (link.getAttribute("href") === "index.html") {
        expect(link.classList.contains("active")).toBe(true);
      }
    });
  });


  test("refreshAlerts calls /alerts/refresh", async () => {
    await indexJS.refreshAlerts();
    expect(fetch).toHaveBeenCalledWith("/alerts/refresh", expect.any(Object));
  });

  test("Risk banner displays correct risk level", async () => {
    await indexJS.loadRiskBanner();
    const banner = document.getElementById("risk-banner");
    expect(banner.textContent).toContain("Moderate Risk");
  });

  test("loadLoginOutcomes updates counts and chart", async () => {
    await indexJS.loadLoginOutcomes();
    expect(document.getElementById("login-success-count").textContent).toBe("1");
    expect(document.getElementById("login-failed-count").textContent).toBe("1");
  });

  test("loadUniqueIPs updates unique IP count", async () => {
    await indexJS.loadUniqueIPs();
    expect(document.getElementById("unique-ip-count").textContent).toBe("2");
  });

  test("loadBlacklistedIPs updates blacklisted IP count", async () => {
    await indexJS.loadBlacklistedIPs();
    expect(document.getElementById("blacklisted-ip-count").textContent).toBe("1");
  });

  test("loadLoginActivityChart renders chart", async () => {
    await indexJS.loadLoginActivityChart();
    // ChartMock used, nothing to assert, just ensure no errors
  });

  test("renderAlertsTable creates clickable rows", () => {
    const alerts = [
      { created_at: new Date().toISOString(), alert_type: "TEST_ALERT", severity: "LOW", ip_address: "1.2.3.4" }
    ];
    indexJS.renderAlertsTable(alerts);
    const row = document.querySelector("#alerts-table-body tr");
    expect(row).toBeTruthy();
    expect(row.classList.contains("clickable-row")).toBe(true);
  });
});
