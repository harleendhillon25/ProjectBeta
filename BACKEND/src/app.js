const express = require("express")
const cors = require("cors")
const app = express()
const logger = require("./middleware/logger")
const apiAuth = require("./middleware/api.auth.js")
const clientAuth = require("./middleware/client.auth.js")

app.use(apiAuth);
//app.use(clientAuth);
app.use(logger);
app.use(cors());
app.use(express.json());

app.use('/clients', require('./routes/clients.routes'));
app.use('/logs', require('./routes/ingest.routes'));
app.use('/alerts', require('./routes/alerts.routes'));
app.use('/ips', require('./routes/iprep.routes'));




module.exports = app;