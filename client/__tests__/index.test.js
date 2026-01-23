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
    expect(document.querySelector("h1").textContent).toBe("Main Dashboard");
  });

  test("logout button exists", () => {
    expect(document.querySelector(".logout-btn").textContent).toBe("Log out");
  });

  test("risk banner is displayed", () => {
    expect(document.querySelector(".risk-banner").textContent)
      .toContain("Moderate Risk");
  });

  test("metrics section displays 3 metric cards", () => {
    expect(document.querySelectorAll(".metric-card").length).toBe(3);
  });

  test("login outcomes card exists", () => {
    expect(document.querySelector(".login-card").textContent)
      .toContain("Login Outcomes");
  });

  test("recent suspicious activity table exists", () => {
    expect(document.querySelector("table")).toBeTruthy();
  });

  test("table contains at least one suspicious IP entry", () => {
    expect(document.querySelectorAll("tbody tr").length).toBeGreaterThan(0);
  });
});
