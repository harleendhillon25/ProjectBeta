/**
 * __tests__/alerts.controller.test.js
 *
 * Controller tests:
 * - refresh_alerts(req,res)
 * - get_alerts(req,res)
 *
 * We mock the model functions so these tests do NOT touch the database.
 */

jest.mock("../../../src/models/alerts.model.js", () => ({
  refresh_alerts_from_sources: jest.fn(),
  get_stored_alerts: jest.fn(),
}));

const {
  refresh_alerts_from_sources,
  get_stored_alerts,
} = require("../../../src/models/alerts.model.js");

const { refresh_alerts, get_alerts } = require("../../../src/controllers/alerts.controller.js");

/**
 * Helper: create a mock Express res object
 * - res.status(code) should be chainable, so it returns res
 * - res.json(payload) captures what got sent back
 */
function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("alerts.controller.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------
  // refresh_alerts controller
  // ----------------------------
  describe("refresh_alerts", () => {
    test("200: calls refresh_alerts_from_sources with body params and returns success payload", async () => {
      // Arrange
      const req = {
        body: {
          window_minutes: 30,
          failed_threshold: 5,
          abuse_threshold: 70,
        },
      };
      const res = makeRes();

      const fakeResult = { failed_login_bursts: 2, blacklisted_ips: 1 };
      refresh_alerts_from_sources.mockResolvedValue(fakeResult);

      // Act
      await refresh_alerts(req, res);

      // Assert: model called with correct args
      expect(refresh_alerts_from_sources).toHaveBeenCalledTimes(1);
      expect(refresh_alerts_from_sources).toHaveBeenCalledWith({
        window_minutes: 30,
        failed_threshold: 5,
        abuse_threshold: 70,
      });

      // Assert: response structure
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Alerts refreshed successfully",
        data: fakeResult,
      });
    });

    test("200: uses default values when body fields are missing", async () => {
      // Arrange: empty body means defaults should apply
      const req = { body: {} };
      const res = makeRes();

      refresh_alerts_from_sources.mockResolvedValue({
        failed_login_bursts: 0,
        blacklisted_ips: 0,
      });

      // Act
      await refresh_alerts(req, res);

      // Assert: default args used
      expect(refresh_alerts_from_sources).toHaveBeenCalledWith({
        window_minutes: 60,
        failed_threshold: 3,
        abuse_threshold: 50,
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    test("500: when model throws, returns error payload with message", async () => {
      // Arrange
      const req = { body: { window_minutes: 60, failed_threshold: 3, abuse_threshold: 50 } };
      const res = makeRes();

      const err = new Error("DB failure");
      refresh_alerts_from_sources.mockRejectedValue(err);

      // Act
      await refresh_alerts(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to refresh alerts",
        error: "DB failure",
      });
    });
  });

  // ----------------------------
  // get_alerts controller
  // ----------------------------
  describe("get_alerts", () => {
    test("200: uses query limit when provided (string) and returns count + data", async () => {
      // Arrange
      const req = { query: { limit: "2" } };
      const res = makeRes();

      const fakeAlerts = [
        { id: 1, alert_type: "FAILED_LOGIN_BURST" },
        { id: 2, alert_type: "BLACKLISTED_IP" },
      ];

      get_stored_alerts.mockResolvedValue(fakeAlerts);

      // Act
      await get_alerts(req, res);

      // Assert: limit parsed to number
      expect(get_stored_alerts).toHaveBeenCalledTimes(1);
      expect(get_stored_alerts).toHaveBeenCalledWith({ limit: 2 });

      // Assert: response payload
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: fakeAlerts,
      });
    });

    test("200: defaults to limit=100 when query limit missing", async () => {
      // Arrange
      const req = { query: {} };
      const res = makeRes();

      get_stored_alerts.mockResolvedValue([]);

      // Act
      await get_alerts(req, res);

      // Assert
      expect(get_stored_alerts).toHaveBeenCalledWith({ limit: 100 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: [],
      });
    });

    test("200: defaults to limit=100 when query limit is not a number (e.g. 'abc')", async () => {
      // Arrange
      const req = { query: { limit: "abc" } };
      const res = makeRes();

      get_stored_alerts.mockResolvedValue([]);

      // Act
      await get_alerts(req, res);

      // parseInt("abc") => NaN, NaN || 100 => 100
      expect(get_stored_alerts).toHaveBeenCalledWith({ limit: 100 });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("500: when model throws, returns error payload", async () => {
      // Arrange
      const req = { query: { limit: "10" } };
      const res = makeRes();

      get_stored_alerts.mockRejectedValue(new Error("Read failed"));

      // Act
      await get_alerts(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch alerts",
        error: "Read failed",
      });
    });
  });
});