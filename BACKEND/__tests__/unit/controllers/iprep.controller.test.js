// refresh_ip_reputation.controller.spec.js
const mockSend = jest.fn();
const mockJson = jest.fn();
const mockEnd = jest.fn();

const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd,
}));

const mockRes = { status: mockStatus };

// Mock the detectionService so the controller gets a mocked enrichRecentIPs
jest.mock("../../../src/services/detectionService", () => ({
  enrichRecentIPs: jest.fn(),
}));

const { enrichRecentIPs } = require("../../../src/services/detectionService");
const { refresh_ip_reputation } = require("../../../src/controllers/iprep.controller"); 


describe("refresh_ip_reputation controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("returns 200 with success message and data when enrichRecentIPs succeeds", async () => {
    // Arrange
    const mockResult = [
      { ip_address: "192.168.0.1", abuse_confidence: 10 },
      { ip_address: "10.0.0.1", abuse_confidence: 90 },
    ];

    enrichRecentIPs.mockResolvedValueOnce(mockResult);

    const mockReq = {};

    // Act
    await refresh_ip_reputation(mockReq, mockRes);

    // Assert
    expect(enrichRecentIPs).toHaveBeenCalledTimes(1);
    expect(mockStatus).toHaveBeenCalledWith(200);

    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: "IP reputation has been sucessfully refreshed",
      count: mockResult.length,
      data: mockResult,
    });
  });

  it("returns 500 with error message when enrichRecentIPs throws", async () => {
    // Arrange
    const error = new Error("DB exploded");
    enrichRecentIPs.mockRejectedValueOnce(error);

    const mockReq = {};

    // Optional: silence console.error in test output
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Act
    await refresh_ip_reputation(mockReq, mockRes);

    // Assert
    expect(enrichRecentIPs).toHaveBeenCalledTimes(1);
    expect(mockStatus).toHaveBeenCalledWith(500);

    expect(mockJson).toHaveBeenCalledWith({
      success: false,
      message: "Failed to refresh the IP reputation",
      error: error.message,
    });

    // Check that we logged the error (optional but nice)
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
