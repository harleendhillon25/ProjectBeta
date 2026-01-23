// ingest.controller.test.js
const { ingestLog } = require('../../../src/controllers/ingest.controller.js');
const { IngestModel } = require('../../../src/models/ingest.model.js');


// Mock the IngestModel class
jest.mock('../../../src/models/ingest.model.js');

describe('ingestLog controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      clientId: 'test-client-id',
      body: {
        eventType: 'login',
        userId: 'user123',
        logDateTime: '2026-01-23T10:00:00Z',
        ipAddress: '192.168.1.1',
        status: 'success'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Clear mocks before each test
    IngestModel.mockClear();
    res.status.mockClear();
    res.json.mockClear();
  });

  it('should insert a log and return 201', async () => {
    // Mock the insertLog method to return a sample row
    IngestModel.prototype.insertLog = jest.fn().mockResolvedValue({
      id: 1,
      client_id: 'test-client-id',
      event_type: 'login',
      user_id: 'user123',
      log_date_time: '2026-01-23T10:00:00Z',
      ip_address: '192.168.1.1',
      status: 'success'
    });

    await ingestLog(req, res);

    // Expect IngestModel to have been called with correct args
    expect(IngestModel).toHaveBeenCalledWith({
      clientId: 'test-client-id',
      eventType: 'login',
      userId: 'user123',
      logDateTime: '2026-01-23T10:00:00Z',
      ipAddress: '192.168.1.1',
      status: 'success'
    });

    // Expect insertLog to have been called
    expect(IngestModel.prototype.insertLog).toHaveBeenCalled();

    // Expect response to be 201 with the inserted log
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Log ingested',
      log: {
        id: 1,
        client_id: 'test-client-id',
        event_type: 'login',
        user_id: 'user123',
        log_date_time: '2026-01-23T10:00:00Z',
        ip_address: '192.168.1.1',
        status: 'success'
      }
    });
  });

  it('should return 400 if required fields are missing', async () => {
    req.body.eventType = null;

    await ingestLog(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
  });

  it('should return 500 if insertLog throws an error', async () => {
    IngestModel.prototype.insertLog = jest.fn().mockRejectedValue(new Error('DB failure'));

    await ingestLog(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });
});