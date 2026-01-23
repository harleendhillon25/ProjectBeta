document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(loginForm);


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
