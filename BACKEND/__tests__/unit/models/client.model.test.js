/**
 * __tests__/clients.model.test.js
 *
 * Tests for clients model functions:
 * - createClient
 * - getClientByEmail
 * - getClientByApiKey
 * - regenerateApiKey
 * - verifyPassword
 *
 * These are PURE unit tests:
 * - database is mocked
 * - uuid is mocked
 * - bcrypt is mocked
 */

// --------------------
// Mocks
// --------------------
const mockPool = {
  query: jest.fn(),
};

jest.mock('../../../src/db/connect.js', () => mockPool);

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const {
  createClient,
  getClientByEmail,
  getClientByApiKey,
  regenerateApiKey,
  verifyPassword,
} = require('../../../src/models/clients.model.js');

// --------------------
// Tests
// --------------------
describe('clients.model.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------
  // createClient
  // --------------------
  describe('createClient', () => {
    test('hashes password, generates api key, inserts client, returns created row', async () => {
      // Arrange
      const fakeHash = 'hashed-password';
      const fakeApiKey = 'uuid-api-key';

      bcrypt.hash.mockResolvedValue(fakeHash);
      uuidv4.mockReturnValue(fakeApiKey);

      const fakeDbRow = {
        id: 1,
        name: 'Zac',
        email: 'zac@test.com',
        password_hash: fakeHash,
        api_key: fakeApiKey,
      };

      mockPool.query.mockResolvedValue({ rows: [fakeDbRow] });

      // Act
      const result = await createClient({
        name: 'Zac',
        email: 'zac@test.com',
        password: 'plaintext-password',
      });

      // Assert: password hashed correctly
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext-password', 10);

      // Assert: api key generated
      expect(uuidv4).toHaveBeenCalledTimes(1);

      // Assert: DB insert called correctly
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO clients (name, email, password_hash, api_key) VALUES ($1,$2,$3,$4) RETURNING *',
        ['Zac', 'zac@test.com', fakeHash, fakeApiKey]
      );

      // Assert: returns inserted row
      expect(result).toEqual(fakeDbRow);
    });
  });

  // --------------------
  // getClientByEmail
  // --------------------
  describe('getClientByEmail', () => {
    test('returns client when found', async () => {
      // Arrange
      const fakeClient = { id: 1, email: 'zac@test.com' };
      mockPool.query.mockResolvedValue({ rows: [fakeClient] });

      // Act
      const result = await getClientByEmail('zac@test.com');

      // Assert
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM clients WHERE email=$1',
        ['zac@test.com']
      );
      expect(result).toEqual(fakeClient);
    });

    test('returns undefined when no client found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await getClientByEmail('missing@test.com');

      expect(result).toBeUndefined();
    });
  });

  // --------------------
  // getClientByApiKey
  // --------------------
  describe('getClientByApiKey', () => {
    test('returns client when api key exists', async () => {
      const fakeClient = { id: 2, api_key: 'abc-123' };
      mockPool.query.mockResolvedValue({ rows: [fakeClient] });

      const result = await getClientByApiKey('abc-123');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM clients WHERE api_key=$1',
        ['abc-123']
      );
      expect(result).toEqual(fakeClient);
    });
  });

  // --------------------
  // regenerateApiKey
  // --------------------
  describe('regenerateApiKey', () => {
    test('generates new api key and updates client', async () => {
      // Arrange
      const newKey = 'new-api-key';
      uuidv4.mockReturnValue(newKey);

      mockPool.query.mockResolvedValue({
        rows: [{ api_key: newKey }],
      });

      // Act
      const result = await regenerateApiKey(42);

      // Assert
      expect(uuidv4).toHaveBeenCalledTimes(1);

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE clients SET api_key=$1, updated_at=NOW() WHERE id=$2 RETURNING api_key',
        [newKey, 42]
      );

      expect(result).toBe(newKey);
    });
  });

  // --------------------
  // verifyPassword
  // --------------------
  describe('verifyPassword', () => {
    test('returns true when password matches hash', async () => {
      // Arrange
      bcrypt.compare.mockResolvedValue(true);

      const client = {
        password_hash: 'hashed-password',
      };

      // Act
      const result = await verifyPassword(client, 'plaintext-password');

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'plaintext-password',
        'hashed-password'
      );
      expect(result).toBe(true);
    });

    test('returns false when password does not match hash', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const client = {
        password_hash: 'hashed-password',
      };

      const result = await verifyPassword(client, 'wrong-password');

      expect(result).toBe(false);
    });
  });
});