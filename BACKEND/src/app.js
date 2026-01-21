const express = require("express")
const cors = require("cors")
const app = express()
const logger = require("./middleware/logger")
const authenticator = require("./middleware/authenticator")

app.use(authenticator);
app.use(logger);
app.use(cors());
app.use(express.json());

app.use('/logs', require('./routes/ingest.routes'));
app.use('/alerts', require('./routes/alert.routes'));
app.use('/ips', require('./routes/iprep.routes'));




module.exports = app;