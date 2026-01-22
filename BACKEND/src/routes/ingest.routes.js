const express =require('express');
const ingestController =require('../controllers/ingest.controller.js');
const apiAuthMiddleware =require('../middleware/api.auth.js');

const ingestRouter = express.Router();

// All /logs requests require API key
ingestRouter.use(apiAuthMiddleware);

// POST /logs → ingest client logs
ingestRouter.post('/', ingestController);

module.exports = ingestRouter;