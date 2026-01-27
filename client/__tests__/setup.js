// client/__tests__/setup.js
const { TextEncoder, TextDecoder } = require("util");

Object.assign(global, { TextEncoder, TextDecoder });

//This will remove the css errors in the front end testing, so I don't have to keep on scrolling
//This is pure AI slop so don't know exactly how it works.

const originalConsoleError = console.error;
let consoleErrorSpy;

beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation((...args) => {
    const firstArg = args[0];

    // Ignore jsdom's CSS parse warning
    if (
      typeof firstArg === "string" &&
      firstArg.includes("Could not parse CSS stylesheet")
    ) {
      return;
    }

    // For everything else, log as normal
    originalConsoleError(...args);
  });
});

afterAll(() => {
  // Only try to restore if the spy was created
  if (consoleErrorSpy) {
    consoleErrorSpy.mockRestore();
  }
});


/////////////////////////////////

// Mock Chart.js globally
global.Chart = jest.fn().mockImplementation(() => ({
  destroy: jest.fn(),
  update: jest.fn(),
  data: {
    labels: [],
    datasets: []
  }
}));

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock sessionStorage
global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
delete global.window.location;
global.window.location = {
  href: '',
  assign: jest.fn(),
  pathname: '/index.html',
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();

  document.body.innerHTML = `
    <div id="risk-banner"></div>

    <span id="login-success-count"></span>
    <span id="login-failed-count"></span>
    <canvas id="loginOutcomesChart"></canvas>

    <span id="unique-ip-count"></span>
    <span id="blacklisted-ip-count"></span>

    <canvas id="loginActivityChart"></canvas>

    <table>
      <tbody id="alerts-table-body"></tbody>
    </table>

    <button id="refresh-alerts"></button>
    <button class="logout-btn">Log out</button>

    <select id="chart-time-period">
      <option value="1"></option>
      <option value="24"></option>
      <option value="168"></option>
    </select>
  `;
});