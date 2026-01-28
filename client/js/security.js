document.addEventListener("DOMContentLoaded", () => {
  const storedAlert = sessionStorage.getItem("selectedAlert");
  const warning = document.getElementById("access-warning");
  const mainContent = document.getElementById("security-content");

  if (!storedAlert) {
    // Show graceful warning instead of blocking
    warning?.classList.remove("hidden");
    mainContent?.classList.add("hidden");

    document.getElementById("go-dashboard")?.addEventListener("click", () => {
      window.location.href = "index.html";
    });

    return;
  }

  const alert = JSON.parse(storedAlert);

  // LOGOUT
  const logoutBtn = document.querySelector(".logout-btn");
  logoutBtn?.addEventListener("click", () => {
    sessionStorage.removeItem("selectedAlert");
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  // SIDEBAR ACTIVE LINK (visual only)
  document.querySelectorAll(".sidebar a").forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === "security.html"
    );
  });

  // LOAD DETAILS
  renderSecurityDetails(alert);
});


// ---------------- LOAD SECURITY DETAILS ----------------
async function loadSecurityDetails() {
  try {
    // relative path instead of localhost
    const res = await fetch("/alerts?limit=20", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
    });

    if (!res.ok) throw new Error("Failed to load security details");

    const json = await res.json();
    const alerts = json.data || [];

    if (alerts.length > 0) {
      renderSecurityDetails(alerts[0]);
    } else {
      showNoThreatsDetected();
    }
  } catch (err) {
    console.error("Security details load error:", err);
    showErrorState("Failed to load security data");
  }
}

// ---------------- RENDER SECURITY DETAILS ----------------
function renderSecurityDetails(alert) {
  const details = alert.details || {};

  // Update alert banner
  const alertBanner = document.querySelector(".alert");
  if (alertBanner) {
    const alertType =
      alert.alert_type_name ||
      alert.alert_type.replace(/_/g, " ").toLowerCase();

    alertBanner.textContent = `⚠️ Alert: ${alertType} detected from ${alert.ip_address}`;

    // Style based on severity
    if (alert.severity === "HIGH") {
      alertBanner.style.backgroundColor = "#ffebee";
      alertBanner.style.color = "#d32f2f";
      alertBanner.style.borderLeft = "4px solid #d32f2f";
    } else if (alert.severity === "MEDIUM") {
      alertBanner.style.backgroundColor = "#fff3e0";
      alertBanner.style.color = "#f57c00";
      alertBanner.style.borderLeft = "4px solid #f57c00";
    } else {
      alertBanner.style.backgroundColor = "#e3f2fd";
      alertBanner.style.color = "#1976d2";
      alertBanner.style.borderLeft = "4px solid #1976d2";
    }
  }

  // Update IP Address
  const ipValue = document.querySelector(".info-box:nth-child(1) .value");
  if (ipValue) {
    ipValue.textContent = alert.ip_address || "Unknown";
  }

  // Update Severity
  const severityValue = document.querySelector(".info-box:nth-child(2) .value");
  if (severityValue) {
    const severityClass = alert.severity.toLowerCase();
    severityValue.innerHTML = `<span class="risk ${severityClass}">${alert.severity} RISK</span>`;
  }

  // Update Location
  const locationValue = document.querySelector(".info-box:nth-child(3) .value");
  if (locationValue) {
    locationValue.textContent = details.country_name || "Unknown";
  }

  // Update Threat Type
  const threatValue = document.querySelector(".info-box:nth-child(4) .value");
  if (threatValue) {
    threatValue.textContent = getThreatTypeName(alert);
  }

  updateFlaggedReason(alert);
  updateAIRecommendedActions(alert);
}

// ---------------- GET THREAT TYPE NAME ----------------
function getThreatTypeName(alert) {
  return alert.alert_type_name || alert.alert_type.replace(/_/g, " ");
}

// ---------------- UPDATE FLAGGED REASON ----------------
function updateFlaggedReason(alert) {
  const reasonParagraph = document.querySelector(".flagged-reason");
  if (!reasonParagraph) return;

  const details = alert.details || {};

  if (alert.alert_type === "FAILED_LOGIN_BURST") {
    const failedCount = details.failed_count || 0;
    const timeWindow = details.window_minutes || 60;
    const lastSeen = details.last_seen
      ? new Date(details.last_seen).toLocaleString()
      : "recently";

    reasonParagraph.textContent =
      `This IP address has made ${failedCount} failed login attempts within ${timeWindow} minutes ` +
      `(last seen: ${lastSeen}). This pattern is consistent with automated password guessing tools.`;

  } else if (alert.alert_type === "BLACKLISTED_IP") {
    const abuseScore = details.abuse_confidence || 0;
    const totalReports = details.total_reports || 0;
    const usageType = details.usage_type || "Unknown";
    const lastReported = details.last_reported_at
      ? new Date(details.last_reported_at).toLocaleDateString()
      : "Unknown";

    reasonParagraph.textContent =
      `This IP has been reported ${totalReports} times with an abuse confidence score of ` +
      `${abuseScore}%. Usage type: ${usageType}. Last reported: ${lastReported}.`;

  } else {
    reasonParagraph.textContent =
      "This IP address has been flagged due to suspicious activity patterns.";
  }
}

// ---------------- UPDATE AI RECOMMENDED ACTIONS ----------------
function updateAIRecommendedActions(alert) {
  const aiResponseText = document.querySelector(".ai-response");
  if (!aiResponseText) return;

  const recommendedActions =
    alert.recommended_action ||
    "Monitor the IP address closely and consider blocking if activity continues.";

  aiResponseText.textContent = `🤖 AI Security Assistant suggests: ${recommendedActions}`;
}

// ---------------- NO THREATS DETECTED ----------------
function showNoThreatsDetected() {
  const alertBanner = document.querySelector(".alert");
  if (alertBanner) {
    alertBanner.textContent = "✅ All Clear: No security threats detected";
    alertBanner.style.backgroundColor = "#e8f5e9";
    alertBanner.style.color = "#2e7d32";
    alertBanner.style.borderLeft = "4px solid #2e7d32";
  }
}

// ---------------- ERROR STATE ----------------
function showErrorState(message) {
  const alertBanner = document.querySelector(".alert");
  if (alertBanner) {
    alertBanner.textContent = `❌ ${message}`;
    alertBanner.style.backgroundColor = "#ffebee";
    alertBanner.style.color = "#d32f2f";
    alertBanner.style.borderLeft = "4px solid #d32f2f";
  }
}

window.addEventListener("beforeunload", () => {
  sessionStorage.removeItem("selectedAlert");
});

document.getElementById("back-to-dashboard")?.addEventListener("click", () => {
  sessionStorage.removeItem("selectedAlert");
  window.location.href = "index.html";
});

if (typeof module !== "undefined") {
  module.exports = {
    loadSecurityDetails,
    renderSecurityDetails,
    getThreatTypeName,
    updateFlaggedReason,
    updateAIRecommendedActions,
    showNoThreatsDetected,
    showErrorState,
  };
}
