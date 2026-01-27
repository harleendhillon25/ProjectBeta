jest.mock('../../../src/db/connect.js', () => ({
  query: jest.fn()
}));

const pool = require('../../../src/db/connect.js');
const { IngestModel, getDistinctIPs, clearAllLogs } = require('../../../src/models/ingest.model');

describe('IngestModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('insertLog()', () => {
    it('should insert a log and return the inserted row', async () => {
      const mockRow = {
        client_id: 'client-1',
        event_type: 'LOGIN',
        user_id: 'user-123',
        log_date_time: '2026-01-22T10:00:00Z',
        ip_address: '192.168.1.1',
        status: 'SUCCESS'
      };

      pool.query.mockResolvedValueOnce({
        rows: [mockRow]
      });

      const model = new IngestModel({
        clientId: 'client-1',
        eventType: 'LOGIN',
        userId: 'user-123',
        logDateTime: '2026-01-22T10:00:00Z',
        ipAddress: '192.168.1.1',
        status: 'SUCCESS'
      });

      const result = await model.insertLog();

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO client_logs'),
        [
          'client-1',
          'LOGIN',
          'user-123',
          '2026-01-22T10:00:00Z',
          '192.168.1.1',
          'SUCCESS'
        ]
      );

      expect(result).toEqual(mockRow);
    });
  });
});

describe('getDistinctIPs()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of distinct IP addresses', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { ip_address: '192.168.1.1' },
        { ip_address: '10.0.0.5' }
      ]
    });

    const result = await getDistinctIPs();

    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT DISTINCT ip_address')
    );

    expect(result).toEqual(['192.168.1.1', '10.0.0.5']);
  });
});

describe("clearAllLogs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("should delete client_logs older than 60 minutes", async () => {
    // Arrange
    jest.spyOn(pool, "query").mockResolvedValueOnce({ rowCount: 5 });

    // Act
    await clearAllLogs();

    // Assert
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith(
      "DELETE FROM client_logs WHERE log_date_time < NOW() - INTERVAL '60 minutes';"
    );
  });

  it("should throw if the database query fails", async () => {
    // Arrange
    const error = new Error("DB error");
    jest.spyOn(pool, "query").mockRejectedValueOnce(error);

    // Act + Assert
    await expect(clearAllLogs()).rejects.toThrow("DB error");
  });
});
