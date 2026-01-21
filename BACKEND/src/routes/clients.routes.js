const express = require('express');
const clientRouter = express.Router();
const clientsController = require('../controllers/clients.controller.js');
const jwtAuth = require('../middleware/client.auth.js');

router.post('/register', clientsController.register);
router.post('/login', clientsController.login);
router.post('/regenerate-api-key', jwtAuth, clientsController.regenerateApiKey);

module.exports = clientRouter;