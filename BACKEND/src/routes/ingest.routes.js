const express =require('express');
const { ingestLog, getLogs } =require('../controllers/ingest.controller.js');
const apiAuthMiddleware =require('../middleware/api.auth.js');

const ingestRouter = express.Router();


// GET /logs → retrieve ingested logs (for testing purposes)
ingestRouter.get("/", getLogs);

// POST /logs → ingest client logs
ingestRouter.post('/', apiAuthMiddleware, ingestLog);



module.exports = ingestRouter;