document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(loginForm);

    // 🔧 TEMP: frontend-only login (until backend is ready)
    // REMOVE fetch later if needed
    if (!form.get("email") || !form.get("password")) {
      alert("Please fill in all fields");
      return;
    }

    // Simulate successful login
    window.location.href = "index.html";
  });

  // Forgot password
  const forgotPassword = document.getElementById("forgot-password");
  if (forgotPassword) {
    forgotPassword.addEventListener("click", (e) => {
      e.preventDefault();
      alert(
        "Your request has been sent to the administrator.\n\nThey will reset your password and email you shortly."
      );
    });
  }
});
