
require("whatwg-fetch");
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
