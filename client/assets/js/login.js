document.getElementById("login-form").addEventListener("submit", async (e) => {
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
    }),
  };

  const response = await fetch("remeber to put the link in", options);
  const data = await response.json();

  if (response.status === 200) {
    window.location.assign("index.html");
  } else {
    alert("Login failed. Please try again.");
  }
});


