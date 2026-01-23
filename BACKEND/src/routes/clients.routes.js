const express = require('express');
const clientRouter = express.Router();
const clientsController = require('../controllers/clients.controller.js');
const jwtAuth = require('../middleware/client.auth.js');

clientRouter.post('/register', clientsController.register);
clientRouter.post('/login', clientsController.login);
clientRouter.post('/regenerate-api-key', jwtAuth, clientsController.regenerateApiKey);

module.exports = clientRouter;