/** @jest-environment jsdom */

describe("security.js", () => {
    beforeEach(() => {
        jest.resetModules();

        document.body.innerHTML = `
      <button class="logout-btn">Log out</button>

      <div class="sidebar">
        <a href="index.html">Dashboard</a>
        <a href="security.html">Threat & Security</a>
        <a href="admin.html">Admin</a>
      </div>

      <div class="alert"></div>

      <div class="info-grid">
        <div class="info-box"><span class="value"></span></div>
        <div class="info-box"><span class="value"></span></div>
        <div class="info-box"><span class="value"></span></div>
        <div class="info-box"><span class="value"></span></div>
      </div>

      <p class="flagged-reason"></p>
      <p class="ai-response"></p>
    `;

        localStorage.setItem("token", "test-token");
        global.fetch = jest.fn();
        window.alert = jest.fn();
        jest.spyOn(console, "error").mockImplementation(() => { });
        delete window.__REDIRECT_TO__;
    });

    afterEach(() => {
        if (console.error.mockRestore) console.error.mockRestore();
    });
    // logout button testing 
    test("logout removes token and redirects", () => {
        require("../js/security.js");

        document.dispatchEvent(new Event("DOMContentLoaded"));

        document.querySelector(".logout-btn").click();

        expect(localStorage.getItem("token")).toBe(null);
        expect(window.__REDIRECT_TO__).toBe("login.html");
    });
    //sidebar active links 
    test("sidebar sets security link as active", () => {
        require("../js/security.js");

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const links = document.querySelectorAll(".sidebar a");
        expect(links[1].classList.contains("active")).toBe(true);
        expect(links[0].classList.contains("active")).toBe(false);
        expect(links[2].classList.contains("active")).toBe(false);
    });
    // loading alert data 
    test("loadSecurityDetails renders first alert when data exists", async () => {
        const security = require("../js/security.js");

        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                data: [
                    {
                        ip_address: "1.2.3.4",
                        severity: "HIGH",
                        alert_type: "FAILED_LOGIN_BURST",
                        alert_type_name: "Failed Login Burst",
                        details: { country_name: "United Kingdom", failed_count: 5, window_minutes: 60 },
                        recommended_action: "Block the IP address.",
                    },
                ],
            }),
        });

        await security.loadSecurityDetails();

        expect(document.querySelector(".alert").textContent).toContain("1.2.3.4");
        expect(document.querySelector(".info-box:nth-child(1) .value").textContent).toBe("1.2.3.4");
        expect(document.querySelector(".info-box:nth-child(3) .value").textContent).toBe("United Kingdom");
        expect(document.querySelector(".flagged-reason").textContent).toContain("failed login attempts");
        expect(document.querySelector(".ai-response").textContent).toContain("Block the IP address.");
    });

    test("renderSecurityDetails styles MEDIUM severity branch", () => {
        const security = require("../js/security.js");

        security.renderSecurityDetails({
            ip_address: "5.6.7.8",
            severity: "MEDIUM",
            alert_type: "BRUTE_FORCE_ATTACK",
            details: { country_name: "France" },
        });

        expect(document.querySelector(".alert").style.borderLeft).toContain("rgb(245, 124, 0)");
        expect(document.querySelector(".flagged-reason").textContent).toContain("password guessing");
    });

    test("renderSecurityDetails styles LOW/other severity branch", () => {
        const security = require("../js/security.js");

        security.renderSecurityDetails({
            ip_address: "9.9.9.9",
            severity: "LOW",
            alert_type: "ACCOUNT_TAKEOVER",
            details: { country_name: "Spain" },
        });

        expect(document.querySelector(".alert").style.borderLeft).toContain("rgb(25, 118, 210)");
        expect(document.querySelector(".flagged-reason").textContent).toContain("potential compromise");
    });
    // Blacklised IP 
    test("BLACKLISTED_IP reason branch", () => {
        const security = require("../js/security.js");

        security.updateFlaggedReason({
            alert_type: "BLACKLISTED_IP",
            details: {
                abuse_confidence: 90,
                total_reports: 12,
                usage_type: "Data Centre",
                last_reported_at: "2025-01-01T00:00:00.000Z",
            },
        });

        expect(document.querySelector(".flagged-reason").textContent).toContain("AbuseIPDB");
    });
    // Default 
    test("default reason branch", () => {
        const security = require("../js/security.js");

        security.updateFlaggedReason({
            alert_type: "SOMETHING_ELSE",
            details: {},
        });

        expect(document.querySelector(".flagged-reason").textContent).toContain("flagged");
    });
    // No Alert case 
    test("no alerts shows no threats state", async () => {
        const security = require("../js/security.js");

        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: [] }),
        });

        await security.loadSecurityDetails();

        expect(document.querySelector(".alert").textContent).toContain("All Clear");
        expect(document.querySelector(".info-box:nth-child(1) .value").textContent).toBe("N/A");
        expect(document.querySelector(".info-box:nth-child(4) .value").textContent).toBe("None");
    });
    // error state
    test("error state shows error banner", async () => {
        const security = require("../js/security.js");

        fetch.mockResolvedValue({
            ok: false,
            json: async () => ({}),
        });

        await security.loadSecurityDetails();

        expect(document.querySelector(".alert").textContent).toContain("Failed to load security data");
    });
    // Threat tyoe name with label 
    test("getThreatTypeName uses alert_type_name if available", () => {
        const security = require("../js/security.js");

        const result = security.getThreatTypeName({
            alert_type: "FAILED_LOGIN_BURST",
            alert_type_name: "Failed Login Burst",
        });

        expect(result).toBe("Failed Login Burst");
    });
    // hreat type formatting
    test("getThreatTypeName converts underscores when no alert_type_name", () => {
        const security = require("../js/security.js");

        const result = security.getThreatTypeName({
            alert_type: "FAILED_LOGIN_BURST",
        });

        expect(result).toBe("FAILED LOGIN BURST");
    });
});
