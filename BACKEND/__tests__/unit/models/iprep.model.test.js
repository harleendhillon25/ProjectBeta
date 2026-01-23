// iprep.model.test.js
const db = require("../../../src/db/connect"); 
const { updateIPReputation } = require("../../../src/models/iprep.model");

describe("updateIPReputation", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  it("inserts or updates an IP reputation record and returns the resulting row", async () => {
    // Arrange
    const record = {
      ipAddress: "192.168.0.1",
      abuseConfidenceScore: 75,
      usageType: "Data Center / Web Hosting / Transit",
      countryName: "United Kingdom",
      totalReports: 10,
      lastReportedAt: "2026-01-20T12:34:56Z",
      checkedAt: "2026-01-21T09:00:00Z",
    };

    const mockRow = {
      id: 1,
      ip_address: "192.168.0.1",
      abuse_confidence: 75,
      usage_type: "Data Center / Web Hosting / Transit",
      country_name: "United Kingdom",
      total_reports: 10,
      last_reported_at: "2026-01-20T12:34:56Z",
      checked_at: "2026-01-21T09:00:00Z",
    };

    jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [mockRow] });

    // Act
    const result = await updateIPReputation(record);

    // Assert
    expect(result).toEqual(mockRow);

    // Check db.query call
    expect(db.query).toHaveBeenCalledTimes(1);
    const [queryText, queryParams] = db.query.mock.calls[0];

    // SQL sanity checks (less brittle than full string equality with newlines)
    expect(queryText).toContain("INSERT INTO ip_reputation");
    expect(queryText).toContain("ip_address");
    expect(queryText).toContain("ON CONFLICT (ip_address)");
    expect(queryText).toContain("DO UPDATE SET");
    expect(queryText).toContain("RETURNING *");

    // Param order check
    expect(queryParams).toEqual([
      record.ipAddress,
      record.abuseConfidenceScore,
      record.usageType,
      record.countryName,
      record.totalReports,
      record.lastReportedAt,
      record.checkedAt,
    ]);
  });

  it("returns undefined if the query returns no rows", async () => {
    // Arrange
    const record = {
      ipAddress: "10.0.0.1",
      abuseConfidenceScore: 0,
      usageType: "Unknown",
      countryName: "Nowhere",
      totalReports: 0,
      lastReportedAt: null,
      checkedAt: "2026-01-21T09:00:00Z",
    };

    jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

    // Act
    const result = await updateIPReputation(record);

    // Assert
    expect(result).toBeUndefined();
  });

  it("propagates database errors", async () => {
    // Arrange
    const record = {
      ipAddress: "203.0.113.5",
      abuseConfidenceScore: 50,
      usageType: "ISP",
      countryName: "France",
      totalReports: 5,
      lastReportedAt: "2026-01-20T10:00:00Z",
      checkedAt: "2026-01-21T09:00:00Z",
    };

    const dbError = new Error("Database connection failed");
    jest.spyOn(db, "query").mockRejectedValueOnce(dbError);

    // Act + Assert
    await expect(updateIPReputation(record)).rejects.toThrow("Database connection failed");
    expect(db.query).toHaveBeenCalledTimes(1);
  });
});
