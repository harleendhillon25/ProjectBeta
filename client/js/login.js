const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      })
    };

    const response = await fetch("remeber to put the link in", options);
    await response.json();

    if (response.status === 200) {
      window.__REDIRECT_TO__ = "index.html";
      try {
        window.location.assign("index.html");
      } catch (err) {
      }

    } else {
      alert("Login failed. Please try again.");
    }
  });
}

// Forgot password link
const forgotPassword = document.getElementById("forgot-password");

if (forgotPassword) {
  forgotPassword.addEventListener("click", (e) => {
    e.preventDefault();
    alert(
      "Your request has been sent to the administrator.\n\nThey will reset your password and email you shortly."
    );
  });

// Caps On function 

(function addCapsLockWarning() {
  const passwordInput = document.querySelector('input[name="password"]');
  if (!passwordInput) return;

  const warning = document.createElement("div");
  warning.textContent = "Caps Lock is ON";
  warning.style.display = "none";
  warning.style.fontSize = "12px";
  warning.style.marginTop = "6px";

  passwordInput.parentElement.appendChild(warning);

  passwordInput.addEventListener("keyup", (e) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      warning.style.display = "block";
    } else {
      warning.style.display = "none";
    }
  });
})();

// Temp lock after to many trys of login












}





