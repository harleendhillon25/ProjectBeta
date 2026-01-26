document.addEventListener("DOMContentLoaded", () => {

   /* const token = localStorage.getItem("token");
  if (!token) {
    window.location.assign("login.html");
    return;
  } */

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

  // LOAD ALERTS
 
// ---------------- ALERTS ----------------
//----- this is the original loadAlerts function with token -----
// async function loadAlerts() {
//   try {
//     const res = await fetch("http://localhost:3000/alerts", 
//       {
//       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//     });
//     if (!res.ok) throw new Error("Failed to load alerts");

//     const json = await res.json();
//     renderAlertsTable(json.data || []);
//   } catch (err) {
//     console.error("Alerts load error:", err);
//   }
// }

// load alerts without token for demo purposes


// loadAlerts();

async function loadAlerts() {
  try {
    const res = await fetch("http://localhost:3000/alerts");
    if (!res.ok) throw new Error("Failed to load alerts");

    const json = await res.json();
    renderAlertsTable(json.data || []);
  } catch (err) {
    console.error("Alerts load error:", err);
  }
}

async function refreshAlerts() {
  try {
    const res = await fetch("http://localhost:3000/alerts/refresh", {
      method: "POST",
       headers: {
      //   Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "x-api-key": "test-api-key-123"
      },
      body: JSON.stringify({ window_minutes: 60, failed_threshold: 3, abuse_threshold: 50 }),
    });
    if (!res.ok) throw new Error("Failed to refresh alerts");
    await loadAlerts();
  } catch (err) {
    console.error("Refresh alerts error:", err);
  }
}
 

// ----------------TIME HELPERS ----------------
function minutesAgo(mins) {
  return Date.now() - mins * 60 * 1000;
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

// RISK BANNER METRICS

function computeRiskLevel(alerts) {
  const todayAlerts = alerts.filter(a => isToday(a.created_at));

  if (todayAlerts.some(a => a.severity === "HIGH")) return "HIGH";
  if (todayAlerts.some(a => a.severity === "MEDIUM")) return "MODERATE";
  return "LOW";
}

async function loadRiskBanner() {
  // const data = await fetch("http://localhost:3000/alerts");
  // const json = await data.json();
  // const alerts = json.data || [];

  const res = await fetch("http://localhost:3000/alerts");
  const json = await res.json(); //works with the mock data we provided
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
}


// LOGIN SUCCESS/FAILURE METRICS

async function loadLoginOutcomes() {
  // const data = await fetch("http://localhost:3000/logs"); // expects array of logs
  // const json = await data.json();
  // const logs = json.data || [];

  const res = await fetch("http://localhost:3000/logs");
  const json = await res.json(); //works with the mock data we provided
  const logs = json.data || [];

  const cutoff = minutesAgo(60);

  const recent = logs.filter(l =>
    new Date(l.log_date_time).getTime() >= cutoff
  );

  const success = recent.filter(l => l.status === "SUCCESS").length;
  const failed = recent.filter(l => l.status === "FAILURE").length;
  const total = success + failed;

  const rate = total === 0 ? 0 : Math.round((success / total) * 100);

  document.getElementById("login-success-rate").textContent = `${rate}%`;
  document.getElementById("login-success-count").textContent = success;
  document.getElementById("login-failed-count").textContent = failed;
}
// UNIQUE IP METRICS

async function loadUniqueIPs() {
  // const data = await fetch("http://localhost:3000/logs");
  // const json = await data.json();
  // const logs = json.data || [];

    const res = await fetch("http://localhost:3000/logs");
    const json = await res.json(); //works with the mock data we provided
    const logs = json.data || [];

  const todayIPs = new Set(
    logs
      .filter(l => isToday(l.log_date_time))
      .map(l => l.ip_address)
  );

  document.getElementById("unique-ip-count").textContent = todayIPs.size;
}

// BLACKLISTED IP METRICS

async function loadBlacklistedIPs() {
  // const data = await fetch("http://localhost:3000/alerts");
  // const json = await data.json();
  // const alerts = json.data || [];

  const res = await fetch("http://localhost:3000/alerts");
  const json = await res.json(); //works with the mock data we provided
  const alerts = json.data || [];


  const count = alerts.filter(a =>
    a.alert_type === "BLACKLISTED_IP" &&
    isToday(a.created_at)
  ).length;

  document.getElementById("blacklisted-ip-count").textContent = count;
}


// ---------------- IP REPUTATION ----------------
async function refreshIPReputation() {
  try {
    const res = await fetch("http://localhost:3000/ips/refresh", {
      method: "POST",
      // headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!res.ok) throw new Error("Failed to refresh IP reputation");
    console.log("IP reputation refreshed");
  } catch (err) {
    console.error("IP reputation refresh error:", err);
  }
}

// ---------------- ALERT TABLE RENDER ----------------
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
    row.innerHTML = `
      <td>${new Date(alert.created_at).toLocaleString()}</td>
      <td>${alert.alert_type.replace(/_/g, " ")}</td>
      <td><span class="tag ${alert.severity.toLowerCase()}">${alert.severity}</span></td>
      <td>${alert.ip_address || "Unknown"}</td>
    `;
    row.title = alert.details ? JSON.stringify(alert.details) : "";
    tbody.appendChild(row);
  });
}

// LOAD METRICS
 async function loadMetrics() {
  await loadAlerts();           // fills the table
  await loadRiskBanner();       // updates risk banner
  await loadLoginOutcomes();    // updates login outcomes
  await loadUniqueIPs();        // updates unique IPs
  await loadBlacklistedIPs();   // updates blacklisted IPs
}


  loadMetrics();

   // REFRESH ALERTS BUTTON
  const refreshBtn = document.getElementById("refresh-alerts");
  refreshBtn?.addEventListener("click", async () => {
    await refreshAlerts();
    await refreshIPReputation();
    await loadMetrics(); // reload all metrics after refresh
  });
});


