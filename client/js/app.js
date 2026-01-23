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
let currentPage = window.location.pathname.split("/").pop();

// Handle default route (Dashboard)
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


