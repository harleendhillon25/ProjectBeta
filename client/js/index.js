// document.addEventListener("DOMContentLoaded", () => {

  // LOGOUT → LOGIN PAGE
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  }

  // SIDEBAR ACTIVE LINK
  let currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "" || currentPage === "/") {
    currentPage = "index.html";
  }

  document.querySelectorAll(".sidebar a").forEach(link => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });


// ---------------- ALERTS ----------------
async function loadAlerts() {
  try {
    const res = await fetch("/alerts");
    if (!res.ok) throw new Error("Failed to load alerts");

    const json = await res.json();
    renderAlertsTable(json.data || []);
  } catch (err) {
    console.error("Alerts load error:", err);
  }
}

async function refreshAlerts() {
  try {
    const res = await fetch("/alerts/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-api-key-123"
      },
      body: JSON.stringify({
        window_minutes: 60,
        failed_threshold: 3,
        abuse_threshold: 50
      }),
    });
    if (!res.ok) throw new Error("Failed to refresh alerts");
    await loadAlerts();
  } catch (err) {
    console.error("Refresh alerts error:", err);
  }
}


// ---------------- TIME HELPERS ----------------
function minutesAgo(mins) {
  return Date.now() - mins * 60 * 1000;
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}


// ---------------- RISK BANNER ----------------
function computeRiskLevel(alerts) {
  const todayAlerts = alerts.filter(a => isToday(a.created_at));

  if (todayAlerts.some(a => a.severity === "HIGH")) return "HIGH";
  if (todayAlerts.some(a => a.severity === "MEDIUM")) return "MODERATE";
  return "LOW";
}

async function loadRiskBanner() {
  try {
    const res = await fetch("/alerts");
    const json = await res.json();
    const alerts = json.data || [];

    const level = computeRiskLevel(alerts);
    const banner = document.getElementById("risk-banner");

    banner.textContent =
      level === "HIGH"
        ? "High Risk Detected Today"
        : level === "MODERATE"
        ? "Moderate Risk Detected Today"
        : "Low Risk Detected Today";

    banner.className = `risk-banner ${level.toLowerCase()}`;
  } catch (err) {
    console.error("Risk banner load error:", err);
  }
}


// ---------------- LOGIN OUTCOMES ----------------
let loginOutcomeChart = null;

async function loadLoginOutcomes() {
  try {
    const res = await fetch("/logs");
    const json = await res.json();
    const logs = json.data || [];

    const cutoff = minutesAgo(60);
    const recent = logs.filter(l =>
      new Date(l.log_date_time).getTime() >= cutoff
    );

    const success = recent.filter(l => l.status === "SUCCESS").length;
    const failed = recent.filter(l => l.status === "FAILURE").length;
    const total = success + failed;

    const rate = total === 0 ? 0 : Math.round((success / total) * 100);

    document.getElementById("login-success-count").textContent = success;
    document.getElementById("login-failed-count").textContent = failed;

    if (loginOutcomeChart) loginOutcomeChart.destroy();

    const ctx = document.getElementById("loginOutcomesChart");
    if (!ctx) return;

    loginOutcomeChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Success", "Failed"],
        datasets: [{
          data: [success, failed],
          backgroundColor: ["#10b981", "#ef4444"],
          borderColor: "#ffffff",
          borderWidth: 3,
        }],
      },
      options: { responsive: true, cutout: "70%" }
    });

  } catch (err) {
    console.error("❌ Login outcomes load error:", err);
  }
}


// ---------------- IP METRICS ----------------
async function loadUniqueIPs() {
  try {
    const res = await fetch("/ips/refresh");
    const json = await res.json();
    const ips = json.data || [];

    const todayIPs = new Set(ips.map(ip => ip.ip_address));
    document.getElementById("unique-ip-count").textContent = todayIPs.size;
  } catch (err) {
    console.error("Unique IPs load error:", err);
  }
}

async function loadBlacklistedIPs() {
  try {
    const res = await fetch("/alerts");
    const json = await res.json();
    const alerts = json.data || [];

    const count = alerts.filter(a =>
      a.alert_type === "BLACKLISTED_IP" && isToday(a.created_at)
    ).length;

    document.getElementById("blacklisted-ip-count").textContent = count;
  } catch (err) {
    console.error("Blacklisted IPs load error:", err);
  }
}

async function refreshIPReputation() {
  try {
    const res = await fetch("/ips/refresh", { method: "POST" });
    if (!res.ok) throw new Error("Failed to refresh IP reputation");
  } catch (err) {
    console.error("IP reputation refresh error:", err);
  }
}


// ---------------- ALERT TABLE ----------------
function renderAlertsTable(alerts) {
  const tbody = document.getElementById("alerts-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!alerts.length) {
    tbody.innerHTML = `<tr><td colspan="4">No suspicious activity detected 🎉</td></tr>`;
    return;
  }

  alerts.forEach(alert => {
    const row = document.createElement("tr");
    row.classList.add("clickable-row");

    row.innerHTML = `
      <td>${new Date(alert.created_at).toLocaleString()}</td>
      <td>${alert.alert_type.replace(/_/g, " ")}</td>
      <td><span class="tag ${alert.severity.toLowerCase()}">${alert.severity}</span></td>
      <td>${alert.ip_address || "Unknown"}</td>
    `;

    row.addEventListener("click", () => {
      sessionStorage.setItem("selectedAlert", JSON.stringify(alert));
      window.location.href = "security.html";
    });

    tbody.appendChild(row);
  });
}


// ---------------- LOAD ALL ----------------
async function loadMetrics() {
  await loadAlerts();
  await loadRiskBanner();
  await loadLoginOutcomes();
  await loadUniqueIPs();
  await loadBlacklistedIPs();
}

loadMetrics();

const refreshBtn = document.getElementById("refresh-alerts");
refreshBtn?.addEventListener("click", async () => {
  await refreshAlerts();
  await refreshIPReputation();
  await loadMetrics();
});


// ---------------- EXPORTS (TESTING) ----------------
const exported = {
  loadAlerts,
  refreshAlerts,
  minutesAgo,
  isToday,
  computeRiskLevel,
  loadRiskBanner,
  loadLoginOutcomes,
  loadUniqueIPs,
  loadBlacklistedIPs,
  refreshIPReputation,
  renderAlertsTable,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = exported;
}

if (typeof window !== "undefined") {
  window.dashboard = exported;
}

// });
