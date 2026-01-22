// LOGIN PAGE → DASHBOARD
const loginForm = document.querySelector(".form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // stop real form submit
    window.location.href = "index.html";
  });
}

// LOGOUT → LOGIN PAGE
const logoutBtn = document.querySelector(".logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

// SIDEBAR NAVIGATION
const dashboardLink = document.querySelector(".nav-dashboard");
const securityLink = document.querySelector(".nav-security");

if (dashboardLink) {
  dashboardLink.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

if (securityLink) {
  securityLink.addEventListener("click", () => {
    window.location.href = "security.html";
  });
}
