/**
 * __tests__/alerts.model.test.js
 *
 * Tests for alerts.model.js using Jest.
 *
 * Key idea:
 * - We mock the DB pool (`../db/connect.js`)
 * - refresh_alerts_from_sources uses pool.connect() -> client.query(...) in a TX
 * - get_stored_alerts uses pool.query(...)
 */

const mockPool = {
  connect: jest.fn(),
  query: jest.fn(),
};

// IMPORTANT: mock the module alerts.model.js imports
jest.mock('../../../src/db/connect.js', () => mockPool);

const { refresh_alerts_from_sources, get_stored_alerts } = require('../../../src/models/alerts.model.js');

describe('alerts.model.js', () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();

    // Fake client returned by pool.connect()
    client = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockPool.connect.mockResolvedValue(client);
  });

  describe('refresh_alerts_from_sources', () => {
    test('happy path: begins tx, processes failed logins + ip reputation, commits, releases, returns counts', async () => {
      /**
       * What we are testing:
       * - It starts a transaction (BEGIN)
       * - It queries failed logins and upserts an alert per row
       * - It queries ip_reputation and upserts an alert per row
       * - It COMMITs
       * - It returns the number of upserts it performed
       * - It releases the client
       */

      // Arrange: make the two SELECT queries return rows.
      const failedRows = [
        { ip_address: '1.1.1.1', failed_count: 4, last_seen: new Date('2026-01-22T10:00:00Z') },
        { ip_address: '2.2.2.2', failed_count: 12, last_seen: new Date('2026-01-22T10:01:00Z') },
      ];

      const ipRepRows = [
        {
          ip_address: '9.9.9.9',
          abuse_confidence: 55,
          usage_type: 'ISP',
          country_name: 'United Kingdom',
          total_reports: 10,
          last_reported_at: new Date('2026-01-20T00:00:00Z'),
          checked_at: new Date('2026-01-22T09:00:00Z'),
        },
      ];

      /**
       * refresh_alerts_from_sources calls client.query() many times:
       * 1) BEGIN
       * 2) failed SELECT
       * 3) upsert per failed row (2 rows => 2 upserts)
       * 4) ip_rep SELECT
       * 5) upsert per ip_rep row (1 row => 1 upsert)
       * 6) COMMIT
       *
       * We'll use mockImplementation to return failedRows when it sees the failed SELECT,
       * and ipRepRows when it sees the ip reputation SELECT.
       */
      client.query.mockImplementation(async (sql) => {
        if (typeof sql === 'string' && sql.includes('BEGIN')) return { rows: [] };
        if (typeof sql === 'string' && sql.includes('FROM client_logs')) return { rows: failedRows };
        if (typeof sql === 'string' && sql.includes('FROM ip_reputation')) return { rows: ipRepRows };
        if (typeof sql === 'string' && sql.includes('INSERT INTO alerts')) return { rows: [] };
        if (typeof sql === 'string' && sql.includes('COMMIT')) return { rows: [] };

        throw new Error(`Unexpected SQL in test:\n${sql}`);
      });

      // Act
      const result = await refresh_alerts_from_sources({
        window_minutes: 60,
        failed_threshold: 3,
        abuse_threshold: 50,
      });

      // Assert: returned counts
      expect(result).toEqual({
        failed_login_bursts: 2,
        blacklisted_ips: 1,
      });

      // Assert: tx boundary and cleanup
      expect(client.query).toHaveBeenCalledWith('BEGIN');
      expect(client.query).toHaveBeenCalledWith('COMMIT');
      expect(client.release).toHaveBeenCalledTimes(1);

      // Assert: SELECT parameter correctness
      // failed SELECT uses [String(window_minutes), failed_threshold]
      const failedSelectCall = client.query.mock.calls.find(
        ([sql]) => typeof sql === 'string' && sql.includes('FROM client_logs')
      );
      expect(failedSelectCall[1]).toEqual(['60', 3]);

      // ip_rep SELECT uses [abuse_threshold]
      const ipRepSelectCall = client.query.mock.calls.find(
        ([sql]) => typeof sql === 'string' && sql.includes('FROM ip_reputation')
      );
      expect(ipRepSelectCall[1]).toEqual([50]);

      // Assert: upsert calls (3 total)
      const upsertCalls = client.query.mock.calls.filter(
        ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO alerts')
      );
      expect(upsertCalls).toHaveLength(3);

      // Assert: severity mapping is correct (indirectly)
      // failed_count 4 => LOW, 12 => MEDIUM (per severity_from_failed_count)
      const failedUpserts = upsertCalls.slice(0, 2);
      expect(failedUpserts[0][1][0]).toBe('FAILED_LOGIN_BURST'); // alert_type
      expect(failedUpserts[0][1][1]).toBe('1.1.1.1');            // ip_address
      expect(failedUpserts[0][1][2]).toBe('LOW');                // severity

      expect(failedUpserts[1][1][1]).toBe('2.2.2.2');
      expect(failedUpserts[1][1][2]).toBe('MEDIUM');

      // ip abuse_confidence 55 => MEDIUM (per severity_from_abuse_score)
      const ipRepUpsert = upsertCalls[2];
      expect(ipRepUpsert[1][0]).toBe('BLACKLISTED_IP');
      expect(ipRepUpsert[1][1]).toBe('9.9.9.9');
      expect(ipRepUpsert[1][2]).toBe('MEDIUM');

      // Assert: details object contains expected keys (sanity check)
      const detailsObj = ipRepUpsert[1][3];
      expect(detailsObj).toEqual(
        expect.objectContaining({
          abuse_confidence: 55,
          threshold: 50,
          usage_type: 'ISP',
          country_name: 'United Kingdom',
        })
      );
    });

    test('uses defaults when no options passed', async () => {
      /**
       * What we are testing:
       * - If refresh_alerts_from_sources() is called with no args,
       *   it uses window_minutes=60, failed_threshold=3, abuse_threshold=50.
       */

      client.query.mockImplementation(async (sql, params) => {
        if (sql === 'BEGIN') return { rows: [] };

        if (typeof sql === 'string' && sql.includes('FROM client_logs')) {
          // Assert defaults applied in params
          expect(params).toEqual(['60', 3]);
          return { rows: [] };
        }

        if (typeof sql === 'string' && sql.includes('FROM ip_reputation')) {
          // Assert defaults applied in params
          expect(params).toEqual([50]);
          return { rows: [] };
        }

        if (sql === 'COMMIT') return { rows: [] };
        return { rows: [] };
      });

      const result = await refresh_alerts_from_sources();

      expect(result).toEqual({
        failed_login_bursts: 0,
        blacklisted_ips: 0,
      });

      expect(client.release).toHaveBeenCalledTimes(1);
    });

    test('rolls back and rethrows if any step fails', async () => {
      /**
       * What we are testing:
       * - If an error occurs after BEGIN, it ROLLBACKs and rethrows
       * - It still releases the client in finally{}
       */

      const boom = new Error('DB exploded');

      client.query.mockImplementation(async (sql) => {
        if (sql === 'BEGIN') return { rows: [] };
        if (typeof sql === 'string' && sql.includes('FROM client_logs')) throw boom;
        if (sql === 'ROLLBACK') return { rows: [] };
        return { rows: [] };
      });

      await expect(refresh_alerts_from_sources()).rejects.toThrow('DB exploded');

      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
      expect(client.release).toHaveBeenCalledTimes(1);

      // Ensure it did NOT commit
      const didCommit = client.query.mock.calls.some(([sql]) => sql === 'COMMIT');
      expect(didCommit).toBe(false);
    });

    test('severity mapping boundaries (indirect): FAILED_LOGIN_BURST HIGH/MEDIUM/LOW', async () => {
      /**
       * What we are testing:
       * - failed_count >= 20 => HIGH
       * - failed_count >= 10 => MEDIUM
       * - else => LOW
       *
       * We verify by checking the severity passed into INSERT params.
       */

      const failedRows = [
        { ip_address: '1.1.1.1', failed_count: 9, last_seen: new Date() },   // LOW
        { ip_address: '2.2.2.2', failed_count: 10, last_seen: new Date() },  // MEDIUM
        { ip_address: '3.3.3.3', failed_count: 20, last_seen: new Date() },  // HIGH
      ];

      client.query.mockImplementation(async (sql) => {
        if (sql === 'BEGIN') return { rows: [] };
        if (typeof sql === 'string' && sql.includes('FROM client_logs')) return { rows: failedRows };
        if (typeof sql === 'string' && sql.includes('FROM ip_reputation')) return { rows: [] };
        if (typeof sql === 'string' && sql.includes('INSERT INTO alerts')) return { rows: [] };
        if (sql === 'COMMIT') return { rows: [] };
        return { rows: [] };
      });

      await refresh_alerts_from_sources();

      const upsertCalls = client.query.mock.calls.filter(
        ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO alerts')
      );

      expect(upsertCalls).toHaveLength(3);

      const severities = upsertCalls.map((call) => call[1][2]);
      expect(severities).toEqual(['LOW', 'MEDIUM', 'HIGH']);
    });

    test('severity mapping boundaries (indirect): BLACKLISTED_IP HIGH/MEDIUM/LOW', async () => {
      /**
       * What we are testing:
       * - abuse_score >= 80 => HIGH
       * - abuse_score >= 50 => MEDIUM
       * - else => LOW
       */

      const ipRepRows = [
        { ip_address: '1.1.1.1', abuse_confidence: 49, usage_type: null, country_name: null, total_reports: 0, last_reported_at: null, checked_at: new Date() }, // LOW
        { ip_address: '2.2.2.2', abuse_confidence: 50, usage_type: null, country_name: null, total_reports: 0, last_reported_at: null, checked_at: new Date() }, // MEDIUM
        { ip_address: '3.3.3.3', abuse_confidence: 80, usage_type: null, country_name: null, total_reports: 0, last_reported_at: null, checked_at: new Date() }, // HIGH
      ];

      client.query.mockImplementation(async (sql) => {
        if (sql === 'BEGIN') return { rows: [] };
        if (typeof sql === 'string' && sql.includes('FROM client_logs')) return { rows: [] };
        if (typeof sql === 'string' && sql.includes('FROM ip_reputation')) return { rows: ipRepRows };
        if (typeof sql === 'string' && sql.includes('INSERT INTO alerts')) return { rows: [] };
        if (sql === 'COMMIT') return { rows: [] };
        return { rows: [] };
      });

      await refresh_alerts_from_sources();

      const upsertCalls = client.query.mock.calls.filter(
        ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO alerts')
      );

      expect(upsertCalls).toHaveLength(3);
      const severities = upsertCalls.map((call) => call[1][2]);
      expect(severities).toEqual(['LOW', 'MEDIUM', 'HIGH']);
    });
  });

  describe('get_stored_alerts', () => {
    test('returns rows from alerts ordered/limited (verifies pool.query called with limit)', async () => {
      /**
       * What we are testing:
       * - get_stored_alerts({limit}) calls pool.query with the SQL + [limit]
       * - returns res.rows
       */

      const fakeRows = [
        { id: 1, alert_type: 'FAILED_LOGIN_BURST' },
        { id: 2, alert_type: 'BLACKLISTED_IP' },
      ];

      mockPool.query.mockResolvedValue({ rows: fakeRows });

      const rows = await get_stored_alerts({ limit: 2 });

      expect(rows).toEqual(fakeRows);

      // Verify limit passed through
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      const [sql, params] = mockPool.query.mock.calls[0];
      expect(sql).toContain('FROM alerts');
      expect(sql).toContain('ORDER BY created_at DESC');
      expect(params).toEqual([2]);
    });

    test('uses default limit=100 if not provided', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      await get_stored_alerts();

      const [, params] = mockPool.query.mock.calls[0];
      expect(params).toEqual([100]);
    });
  });
});