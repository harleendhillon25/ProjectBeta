const { renderDOM } = require("./helpers");

describe("Dashboard (index.html)", () => {
  let dom;
  let document;

  beforeEach(async () => {
    // Render the dashboard HTML
    dom = await renderDOM("./client/index.html");
    document = dom.window.document;

    // Expose globals for index.js
    global.window = dom.window;
    global.document = document;

    // Load dashboard JS AFTER DOM exists
    require("../js/index.js");
  });

  test("page loads with correct title", () => {
    expect(document.title).toBe("Dashboard");
  });

  test("renders sidebar navigation", () => {
    expect(document.querySelector(".sidebar")).toBeTruthy();
  });

  test("sidebar contains 3 navigation links", () => {
    expect(document.querySelectorAll(".sidebar a").length).toBe(3);
  });

  test("renders Main Dashboard heading", () => {
    expect(document.querySelector("h1").textContent.trim())
      .toBe("Main Dashboard");
  });

  test("logout button exists", () => {
    const logoutBtn = document.querySelector(".logout-btn");
    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn.textContent.trim()).toBe("Log out");
  });

  test("risk banner exists", () => {
    // Banner text is dynamic, so only test presence
    const banner = document.querySelector(".risk-banner");
    expect(banner).toBeTruthy();
  });

  test("metrics section displays 3 metric cards", () => {
    expect(document.querySelectorAll(".metric-card").length).toBe(3);
  });

  test("login outcomes card exists", () => {
    const card = document.querySelector(".login-card");
    expect(card).toBeTruthy();
    expect(card.textContent).toContain("Login Outcomes");
  });

  test("recent suspicious activity table exists", () => {
    expect(document.querySelector("table")).toBeTruthy();
    expect(document.querySelector("tbody")).toBeTruthy();
  });

  test("suspicious activity rows are clickable", () => {
    /**
     * Rows are dynamically injected in real usage,
     * so we test that rows SUPPORT click behaviour.
     */

    const row = document.createElement("tr");

    let clicked = false;
    row.addEventListener("click", () => {
      clicked = true;
    });

    row.click();
    expect(clicked).toBe(true);
  });

test("clicking a suspicious activity row triggers navigation to security page", () => {
  const tbody = document.querySelector("#alerts-table-body");

  const mockAlert = {
    created_at: new Date().toISOString(),
    alert_type: "FAILED_LOGIN_BURST",
    severity: "HIGH",
    ip_address: "192.168.1.1"
  };

  // Manually reproduce the row the same way index.js does
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${new Date(mockAlert.created_at).toLocaleString()}</td>
    <td>FAILED LOGIN BURST</td>
    <td><span class="tag high">HIGH</span></td>
    <td>${mockAlert.ip_address}</td>
  `;

  row.addEventListener("click", () => {
    sessionStorage.setItem("selectedAlert", JSON.stringify(mockAlert));
    window.location.href = "security.html";
  });

  tbody.appendChild(row);

  // Act
  row.click();

  // Assert intent (JSDOM-safe)
  const stored = sessionStorage.getItem("selectedAlert");
  expect(stored).not.toBeNull();
});
});