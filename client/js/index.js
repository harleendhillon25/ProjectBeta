document.addEventListener("DOMContentLoaded", () => {

  //   const token = localStorage.getItem("token");
  // if (!token) {
  //   window.location.assign("login.html");
  //   return;
  // }

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
 try {

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
  } catch (err) {
    console.error("Risk banner load error:", err);
  }
}


// LOGIN SUCCESS/FAILURE METRICS
let loginOutcomeChart = null;

async function loadLoginOutcomes() {
  try {
    const res = await fetch("http://localhost:3000/logs");
    const json = await res.json(); //works with the mock data we provided
    const logs = json.data || [];

    const cutoff = minutesAgo(60); // Last 60 minutes

    const recent = logs.filter(l =>
      new Date(l.log_date_time).getTime() >= cutoff
    );

    const success = recent.filter(l => l.status === "SUCCESS").length;
    const failed = recent.filter(l => l.status === "FAILURE").length;
    const total = success + failed;

    const rate = total === 0 ? 0 : Math.round((success / total) * 100);

    document.getElementById("login-success-count").textContent = success;
    document.getElementById("login-failed-count").textContent = failed;
// Destroy existing chart if it exists
    if (loginOutcomeChart) {
      loginOutcomeChart.destroy();
    }

    // Create donut chart
    const ctx = document.getElementById("loginOutcomesChart");
    if (!ctx) {
      console.error("Login outcomes chart canvas not found");
      return;
    }

    loginOutcomeChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Success", "Failed"],
        datasets: [
          {
            data: [success, failed],
            backgroundColor: [
              "#10b981", // Green for success
              "#ef4444", // Red for failed
            ],
            borderColor: "#ffffff",
            borderWidth: 3,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "70%", // Makes it a donut (hollow center)
        plugins: {
          legend: {
            display: false, // Hide legend (we have our own below)
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            titleFont: {
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              size: 13,
            },
            callbacks: {
              label: function(context) {
                const label = context.label || "";
                const value = context.parsed || 0;
                const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: "easeInOutQuart",
        },
      },
      plugins: [
        {
          id: "centerText",
          afterDatasetsDraw(chart) {
            const { ctx, chartArea } = chart;
            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;

            ctx.save();
            ctx.font = "bold 28px 'Segoe UI', sans-serif";
            ctx.fillStyle = "#1f2937";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${rate}%`, centerX, centerY - 10);

            ctx.font = "14px 'Segoe UI', sans-serif";
            ctx.fillStyle = "#6b7280";
            ctx.fillText("Successful", centerX, centerY + 15);
            ctx.restore();
          },
        },
      ],
    });
    console.log(`✅ Login outcomes chart loaded: ${success} success, ${failed} failed`);
  } catch (err) {
    console.error("❌ Login outcomes load error:", err);
  }
}
// UNIQUE IP METRICS

async function loadUniqueIPs() {
  try {
  const res = await fetch("http://localhost:3000/ips/refresh");
  const json = await res.json();
  const ips = json.data || [];

  const todayIPs = new Set(
    ips
      // .filter(ip => isToday(ip.checked_at))
      .map(ip => ip.ip_address)
  );

  document.getElementById("unique-ip-count").textContent = todayIPs.size;
  } catch (err) {
    console.error("Unique IPs load error:", err);
  }
}

// BLACKLISTED IP METRICS

async function loadBlacklistedIPs() {
  try {
  const res = await fetch("http://localhost:3000/alerts");
  const json = await res.json(); //works with the mock data we provided
  const alerts = json.data || [];


  const count = alerts.filter(a =>
    a.alert_type === "BLACKLISTED_IP" &&
    isToday(a.created_at)
  ).length;

  document.getElementById("blacklisted-ip-count").textContent = count;
  } catch (err) {
    console.error("Blacklisted IPs load error:", err);
  }
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
    row.classList.add("clickable-row");

    row.innerHTML = `
      <td>${new Date(alert.created_at).toLocaleString()}</td>
      <td>${alert.alert_type.replace(/_/g, " ")}</td>
      <td>
        <span class="tag ${alert.severity.toLowerCase()}">
          ${alert.severity}
        </span>
      </td>
      <td>${alert.ip_address || "Unknown"}</td>
    `;

    // 👉 CLICK HANDLER
    row.addEventListener("click", () => {
      sessionStorage.setItem(
        "selectedAlert",
        JSON.stringify(alert)
      );
      window.location.href = "security.html";
    });

    tbody.appendChild(row);
  });
}

// ================ LOGIN ACTIVITY CHART (WITH TIME PERIOD SELECTOR) ================ 
let chartInstance = null; // Store chart instance globally

async function loadLoginActivityChart(hoursBack = 24) {
  try {
    const res = await fetch("http://localhost:3000/alerts");
    const json = await res.json();
    const alerts = json.data || [];

    // Determine grouping (hour vs day)
    const isMultiDay = hoursBack > 48;
    const groupBy = isMultiDay ? "day" : "hour";
    
    // Group alerts by time period
    const timeData = {};
    const now = new Date();
    
    // Initialize time buckets
    if (groupBy === "hour") {
      for (let i = hoursBack - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const key = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:00`;
        timeData[key] = { 
          failed_login_burst: 0, 
          blacklisted_ip: 0,
          total: 0
        };
      }
    } else {
      const daysBack = Math.ceil(hoursBack / 24);
      for (let i = daysBack - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = `${time.getMonth() + 1}/${time.getDate()}`;
        timeData[key] = { 
          failed_login_burst: 0, 
          blacklisted_ip: 0,
          total: 0
        };
      }
    }

    // Count alerts
    alerts.forEach(alert => {
      const alertDate = new Date(alert.created_at);
      const timeDiff = (now - alertDate) / (60 * 60 * 1000); // hours
      
      if (timeDiff >= 0 && timeDiff < hoursBack) {
        let key;
        if (groupBy === "hour") {
          key = `${alertDate.getMonth() + 1}/${alertDate.getDate()} ${alertDate.getHours()}:00`;
        } else {
          key = `${alertDate.getMonth() + 1}/${alertDate.getDate()}`;
        }
        
        if (timeData[key]) {
          if (alert.alert_type === "FAILED_LOGIN_BURST") {
            timeData[key].failed_login_burst++;
          } else if (alert.alert_type === "BLACKLISTED_IP") {
            timeData[key].blacklisted_ip++;
          }
          timeData[key].total++;
        }
      }
    });

    // Prepare data
    const labels = Object.keys(timeData);
    const failedLoginData = labels.map(label => timeData[label].failed_login_burst);
    const blacklistedIPData = labels.map(label => timeData[label].blacklisted_ip);
    const totalAlerts = labels.map(label => timeData[label].total);

    // Destroy existing chart if exists
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Create chart
    const ctx = document.getElementById("loginActivityChart");
    if (!ctx) {
      console.error("Chart canvas not found");
      return;
    }

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Failed Login Bursts",
            data: failedLoginData,
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: "Blacklisted IP Alerts",
            data: blacklistedIPData,
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
          {
            label: "Total Alerts",
            data: totalAlerts,
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12,
                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              },
            },
          },
          title: {
            display: true,
            text: `Security Alerts - Last ${hoursBack > 24 ? Math.ceil(hoursBack / 24) + ' Days' : hoursBack + ' Hours'}`,
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            titleFont: {
              size: 14,
            },
            bodyFont: {
              size: 13,
            },
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} alerts`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: groupBy === "hour" ? "Time (Hour)" : "Date",
              font: {
                size: 13,
                weight: "bold",
              },
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Alerts",
              font: {
                size: 13,
                weight: "bold",
              },
            },
            ticks: {
              stepSize: 1,
              precision: 0,
            },
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
          },
        },
      },
    });

    console.log(`✅ Chart loaded: Last ${hoursBack} hours`);
  } catch (err) {
    console.error("❌ Chart load error:", err);
  }
}

// LOAD METRICS
 async function loadMetrics() {
  await loadAlerts();           // fills the table
  await loadRiskBanner();       // updates risk banner
  await loadLoginOutcomes();    // updates login outcomes
  await loadUniqueIPs();        // updates unique IPs
  await loadBlacklistedIPs();   // updates blacklisted IPs
  await loadLoginActivityChart(); // updates login activity chart
}


  loadMetrics();

   // REFRESH ALERTS BUTTON
  const refreshBtn = document.getElementById("refresh-alerts");
  refreshBtn?.addEventListener("click", async () => {
    await refreshAlerts();
    await refreshIPReputation();
    await loadMetrics(); // reload all metrics after refresh
  });

   // TIME PERIOD SELECTOR
  const timePeriodSelect = document.getElementById("chart-time-period");
  timePeriodSelect?.addEventListener("change", (e) => {
    const hours = parseInt(e.target.value);
    loadLoginActivityChart(hours);
  });
});


