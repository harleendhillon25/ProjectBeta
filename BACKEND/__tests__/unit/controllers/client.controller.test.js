/**
 * __tests__/clients.controller.test.js
 *
 * Unit tests for:
 * - register
 * - login
 * - regenerateApiKey
 *
 * We mock:
 * - jsonwebtoken (jwt.sign)
 * - client model functions (createClient/getClientByEmail/verifyPassword/regenerateApiKey)
 */

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../../src/models/clients.model.js', () => ({
  createClient: jest.fn(),
  getClientByEmail: jest.fn(),
  verifyPassword: jest.fn(),
  regenerateApiKey: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const clientModel = require('../../../src/models/clients.model.js');

const { register, login, regenerateApiKey } = require('../../../src/controllers/clients.controller.js');

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('clients.controller.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Provide a default secret for tests (since controller uses process.env.JWT_SECRET)
    process.env.JWT_SECRET = 'test-secret';
  });

  // -----------------------
  // register
  // -----------------------
  describe('register', () => {
    test('400 if missing fields', async () => {
      const req = { body: { name: 'Zac', email: '' } }; // missing password + email empty
      const res = makeRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing fields' });

      // Ensure it never calls the model
      expect(clientModel.createClient).not.toHaveBeenCalled();
    });

    test('201 creates client and returns clientId + apiKey', async () => {
      const req = { body: { name: 'Zac', email: 'zac@test.com', password: 'pass123' } };
      const res = makeRes();

      clientModel.createClient.mockResolvedValue({
        id: 123,
        api_key: 'api-key-xyz',
      });

      await register(req, res);

      expect(clientModel.createClient).toHaveBeenCalledWith({
        name: 'Zac',
        email: 'zac@test.com',
        password: 'pass123',
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Client created',
        clientId: 123,
        apiKey: 'api-key-xyz',
      });
    });

    test('500 if model throws', async () => {
      const req = { body: { name: 'Zac', email: 'zac@test.com', password: 'pass123' } };
      const res = makeRes();

      clientModel.createClient.mockRejectedValue(new Error('db down'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  // -----------------------
  // login
  // -----------------------
  describe('login', () => {
    test('400 if missing fields', async () => {
      const req = { body: { email: 'zac@test.com' } }; // missing password
      const res = makeRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing fields' });

      expect(clientModel.getClientByEmail).not.toHaveBeenCalled();
      expect(clientModel.verifyPassword).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('401 if no client found', async () => {
      const req = { body: { email: 'zac@test.com', password: 'pass123' } };
      const res = makeRes();

      clientModel.getClientByEmail.mockResolvedValue(undefined);

      await login(req, res);

      expect(clientModel.getClientByEmail).toHaveBeenCalledWith('zac@test.com');

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });

      expect(clientModel.verifyPassword).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('401 if password invalid', async () => {
      const req = { body: { email: 'zac@test.com', password: 'wrong' } };
      const res = makeRes();

      const fakeClient = { id: 7, email: 'zac@test.com', password_hash: 'hash' };
      clientModel.getClientByEmail.mockResolvedValue(fakeClient);
      clientModel.verifyPassword.mockResolvedValue(false);

      await login(req, res);

      expect(clientModel.getClientByEmail).toHaveBeenCalledWith('zac@test.com');
      expect(clientModel.verifyPassword).toHaveBeenCalledWith(fakeClient, 'wrong');

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('200 returns token when credentials valid (jwt.sign called with correct args)', async () => {
      const req = { body: { email: 'zac@test.com', password: 'pass123' } };
      const res = makeRes();

      const fakeClient = { id: 42, email: 'zac@test.com' };
      clientModel.getClientByEmail.mockResolvedValue(fakeClient);
      clientModel.verifyPassword.mockResolvedValue(true);

      jwt.sign.mockReturnValue('fake-jwt-token');

      await login(req, res);

      // Verify model calls
      expect(clientModel.getClientByEmail).toHaveBeenCalledWith('zac@test.com');
      expect(clientModel.verifyPassword).toHaveBeenCalledWith(fakeClient, 'pass123');

      // Verify jwt.sign payload + secret + options
      expect(jwt.sign).toHaveBeenCalledWith(
        { clientId: 42 },
        'test-secret',
        { expiresIn: '2h' }
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'fake-jwt-token',
      });
    });

    test('500 if something throws during login flow', async () => {
      const req = { body: { email: 'zac@test.com', password: 'pass123' } };
      const res = makeRes();

      clientModel.getClientByEmail.mockRejectedValue(new Error('db broken'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  // -----------------------
  // regenerateApiKey
  // -----------------------
  describe('regenerateApiKey', () => {
    test('200 returns new api key for req.clientId', async () => {
      const req = { clientId: 99 };
      const res = makeRes();

      clientModel.regenerateApiKey.mockResolvedValue('new-key-123');

      await regenerateApiKey(req, res);

      expect(clientModel.regenerateApiKey).toHaveBeenCalledWith(99);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'API key regenerated',
        apiKey: 'new-key-123',
      });
    });

    test('500 if model throws', async () => {
      const req = { clientId: 99 };
      const res = makeRes();

      clientModel.regenerateApiKey.mockRejectedValue(new Error('update failed'));

      await regenerateApiKey(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});