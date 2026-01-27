require("dotenv").config();

const { enrichRecentIPs } = require("../services/detectionService"); 

async function run() {
  try {
    console.log("Starting IP reputation refresh…");
    const results = await enrichRecentIPs();

    console.log("Refresh complete. Summary:", {
      totalIPs: results.length,
      ok: results.filter(r => r.status === "ok").length,
      errors: results.filter(r => r.status === "error").length,
    });

    process.exit(0);
  } catch (err) {
    console.error("Fatal error during IP reputation refresh:", err);
    process.exit(1);
  }
}

run();
