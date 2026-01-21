const express =require('express');
const ingestController =require('../controllers/ingest.controller.js');
//import authMiddleware from '../middleware/auth.js';

const ingestRouter = express.Router();

// All /logs requests require API key
ingestRouter.use(authMiddleware);

// POST /logs → ingest client logs
ingestRouter.post('/', ingestController);

module.exports = ingestRouter;