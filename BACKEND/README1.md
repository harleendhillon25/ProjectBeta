# ProjectBeta

.github --> workflows --> yml
backend --> 
    risk processing engine --> app, index, fetchLog.js, fetchIP/API.js
    log parser --> fetchRawLog.js (output of raw data goes into log_csv)
frontend --> html, css, js, loadLog.js 
tests --> front end/, back end 
db --> log_csv, log.json


## Sample code for clients 

``` JS
fetch("https://api.riskradar.app/logs", {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-api-key": "CLIENT_API_KEY" },
  body: JSON.stringify({
    event_type: "login_attempt",
    user_id: user.id,
    role: user.role,
    success: false,
    ip_address: req.ip,
    timestamp: new Date().toISOString()
  })
});
```

2️⃣ Why RiskRadar Still Needs a Parser

Even though the JSON matches the schema in the sample, RiskRadar cannot trust that all clients will follow it perfectly. Here’s why:

Potential Issue	        Example
Missing fields	        role missing
Different naming	    ip instead of ip_address
Wrong data type	        "success": "false" (string) instead of boolean
Bad timestamp	        "2026-13-01T09:00:00Z"
Extra noise	            debug_info included

The parser ensures:

Validation – required fields exist and types are correct
Normalization – field names consistent across clients
Enrichment – add derived info (e.g., is_privileged, geo_location)
Error handling – reject or log malformed entries


3️⃣ Think of the Parser as a Safety Net

Even with a perfect client, RiskView’s parser:
Guarantees all logs entering the risk engine are standardised
Makes the risk rules deterministic and explainable
Keeps the system robust against misconfigured clients or future log changes
In other words: the client provides JSON → parser verifies & standardizes → risk engine consumes it.

4️⃣ Optional Optimization

For clients who follow your “perfect schema” exactly:
Parsing is minimal — mostly type checks and timestamp normalization
You can skip field mapping entirely in some cases
But the parser still exists as a guardrail

✅ TL;DR

Client sends JSON (matches your schema in the sample code)
Parser still needed to ensure logs are always:
Valid
Normalized
Enriched
Actionable
Without the parser, one misconfigured client could break your rules engine


backend
    .github/
        workflows                                       # background / scheduled tasks
    package.json                                        # metadata, dependencies, scripts          
    .env                                                # environment variables      
    src/               
        server.js                                       # application entry point
        app.js                                          # express app setup (middleware, routes)
        db/
            setup.sql                                 
            connection.js                               # postgres connection pool 
        middleware/
            logger.js
            authenticator.js
        routes/
            ingest.routes.js                            # ingesting client log data ( POST /ingest/logs)
            alerts.routes.js
            ips.routes.js                               # retrieving flagged / blacklisted
        controllers/
            ingest.controllers.js
            alerts.controllers.js
            ips.controllers.js
        services/                                       # business logic and orchestration
            detection.service.js                        #runs security rules (failed logins, blacklisted IPs)
        models/
            ingest.models.js                            # inserts and queries (normalised?) ingest data
            alerts.models.js                            # creates alert records ??
            iprep.models.js                             # stores and retrieves IP reputation results





### package dependencies

npm install bcrypt uuid jsonwebtoken cors express




