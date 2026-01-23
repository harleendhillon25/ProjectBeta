module.exports = {
  projects: [
    {
      displayName: "backend",
      testEnvironment: "node",
      testMatch: ["<rootDir>/BACKEND/__tests__/**/*.test.js"],
    },
    {
      displayName: "frontend",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/client/__tests__/*.test.js"],
      setupFilesAfterEnv: ["<rootDir>/client/__tests__/setup.js"],
      testPathIgnorePatterns: ["<rootDir>/client/__tests__/helpers.js"],
    },
  ],
};
