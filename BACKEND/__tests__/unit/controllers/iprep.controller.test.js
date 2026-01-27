jest.mock("../../../src/services/detectionService.js", () => ({
  enrichRecentIPs: jest.fn(),
}));

const { enrichRecentIPs } = require("../../../src/services/detectionService.js");
const pool = require("../../../src/db/connect.js");
const {
  refresh_ip_reputation,
  getIpReputation,
} = require("../../../src/controllers/iprep.controller.js");

// Helper to create a mock Express res object
function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("iprep.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  // refresh_IP_reputation
  describe("refresh_ip_reputation", () => {
    test("200: calls enrichRecentIPs and returns success payload with count and data", async () => {
      // Arrange
      const req = {}; // no body needed
      const res = makeRes();

      const fakeResult = [
        { ip_address: "10.0.0.1", abuse_confidence: 90 },
        { ip_address: "10.0.0.2", abuse_confidence: 60 },
      ];

      enrichRecentIPs.mockResolvedValueOnce(fakeResult);

      // Act
      await refresh_ip_reputation(req, res);

      // Assert
      expect(enrichRecentIPs).toHaveBeenCalledTimes(1);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        // keep the original spelling from the controller:
        message: "IP reputation has been sucessfully refreshed",
        count: fakeResult.length,
        data: fakeResult,
      });
    });

    test("500: when enrichRecentIPs throws, returns error payload", async () => {
      // Arrange
      const req = {};
      const res = makeRes();

      const err = new Error("Abuse API failure");
      enrichRecentIPs.mockRejectedValueOnce(err);

      // Act
      await refresh_ip_reputation(req, res);

      // Assert
      expect(enrichRecentIPs).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to refresh the IP reputation",
        error: "Abuse API failure",
      });
    });
  });

  // getIPReputation

  describe("getIpReputation", () => {
    test("200: returns rows from ip_reputation in data field", async () => {
      // Arrange
      const req = {};
      const res = makeRes();

      const fakeRows = [
        {
          ip_address: "10.0.0.1",
          abuse_confidence: 90,
          usage_type: "Data Center",
          country_name: "UK",
          total_reports: 50,
          last_reported_at: "2026-01-25T10:00:00Z",
          checked_at: "2026-01-26T10:00:00Z",
        },
      ];

      jest.spyOn(pool, "query").mockResolvedValueOnce({ rows: fakeRows });

      // Act
      await getIpReputation(req, res);

      // Assert
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("FROM ip_reputation")
      );

      expect(res.json).toHaveBeenCalledWith({ data: fakeRows });
    });

    test("500: when db query fails, returns error payload", async () => {
      // Arrange
      const req = {};
      const res = makeRes();

      jest
        .spyOn(pool, "query")
        .mockRejectedValueOnce(new Error("DB failure"));

      // Act
      await getIpReputation(req, res);

      // Assert
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch IP reputation data",
      });
    });
  });
});
