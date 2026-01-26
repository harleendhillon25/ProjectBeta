const loginForm = document.getElementById("login-form");

// LOGIN PAGE → DASHBOARD
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    try {
      const response = await fetch("http://localhost:3000/clients/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password")
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store JWT for authenticated requests
      localStorage.setItem("token", data.token);

      // Redirect on success
      window.location.assign("index.html");

    } catch (err) {
      console.error("Login error:", err.message);
      alert("Login failed. Please check your credentials.");
    }
  });
}

// INDEX.JS

document.addEventListener("DOMContentLoaded", () => {

  // 🔐 AUTH GUARD
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.assign("login.html");
    return;
  }

  // LOGOUT → LOGIN PAGE
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.assign("login.html");
    });
  }

  // SIDEBAR ACTIVE LINK
  let currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "" || currentPage === "/") {
    currentPage = "index.html";
  }

  document.querySelectorAll(".sidebar a").forEach(link => {
    const linkPage = link.getAttribute("href");
    link.classList.toggle("active", linkPage === currentPage);
  });

  // LOAD ALERTS
  loadAlerts();

  // REFRESH ALERTS BUTTON
  const refreshBtn = document.getElementById("refresh-alerts");
  refreshBtn?.addEventListener("click", async () => {
    await refreshAlerts();
    await refreshIPReputation();
  });
});

// ---------------- ALERTS ----------------
async function loadAlerts() {
  try {
    const res = await fetch("http://localhost:3000/alerts", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
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
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ window_minutes: 60, failed_threshold: 3, abuse_threshold: 50 }),
    });
    if (!res.ok) throw new Error("Failed to refresh alerts");
    await loadAlerts();
  } catch (err) {
    console.error("Refresh alerts error:", err);
  }
}

// ---------------- IP REPUTATION ----------------
async function refreshIPReputation() {
  try {
    const res = await fetch("http://localhost:3000/ips/refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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


<tbody id="alerts-table-body">
  <!-- Alerts injected here -->
</tbody>