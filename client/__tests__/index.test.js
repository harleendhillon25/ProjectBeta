const { renderDOM } = require("./helpers");

// index.html tests
describe("Dashboard (index.html)", () => {
  let dom;
  let document;

  beforeEach(async () => {
    dom = await renderDOM("./client/index.html");
    document = dom.window.document;
  });

  test("page loads with correct title", () => {
    expect(document.title).toBe("Dashboard");
  });

  test("renders sidebar navigation", () => {
    const sidebar = document.querySelector(".sidebar");
    expect(sidebar).toBeTruthy();
  });

  test("sidebar contains 3 navigation links", () => {
    const links = document.querySelectorAll(".sidebar a");
    expect(links.length).toBe(3);
  });

  test("renders Main Dashboard heading", () => {
    const h1 = document.querySelector("h1");
    expect(h1).toBeTruthy();
    expect(h1.textContent).toBe("Main Dashboard");
  });

  test("logout button exists", () => {
    const logoutBtn = document.querySelector(".logout-btn");
    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn.textContent).toBe("Log out");
  });

  test("risk banner is displayed", () => {
    const banner = document.querySelector(".risk-banner");
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain("Moderate Risk");
  });

  test("metrics section displays 3 metric cards", () => {
    const cards = document.querySelectorAll(".metric-card");
    expect(cards.length).toBe(3);
  });

  test("login outcomes card exists", () => {
    const loginCard = document.querySelector(".login-card");
    expect(loginCard).toBeTruthy();
    expect(loginCard.textContent).toContain("Login Outcomes");
  });

  test("recent suspicious activity table exists", () => {
    const table = document.querySelector("table");
    expect(table).toBeTruthy();
  });

  test("table contains at least one suspicious IP entry", () => {
    const rows = document.querySelectorAll("tbody tr");
    expect(rows.length).toBeGreaterThan(0);
  });
});
