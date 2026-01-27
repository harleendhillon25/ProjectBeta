const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const logger = require("./middleware/logger");
const apiAuth = require("./middleware/api.auth.js");
const clientAuth = require("./middleware/client.auth.js");

// app.use(apiAuth);
// app.use(clientAuth);
app.use(logger);
app.use(cors());
app.use(express.json());

// Front end routes
app.use(express.static(path.join(__dirname, "..", "..", "client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "client", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "client", "login.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "client", "admin.html"));
});

app.get("/security", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "client", "security.html"));
});

// API routes
app.use("/clients", require("./routes/clients.routes"));
app.use("/logs", require("./routes/ingest.routes"));
app.use("/alerts", require("./routes/alerts.routes"));
app.use("/ips", require("./routes/iprep.routes"));

module.exports = app;
