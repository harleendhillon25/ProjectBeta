
document.addEventListener("DOMContentLoaded", () => {
    // checks if an alert box exists 
  const alertBox = document.querySelector(".alert");
  if (alertBox) {
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Dismiss";
    closeBtn.style.marginLeft = "12px";
    closeBtn.style.padding = "6px 10px";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "6px";
    closeBtn.style.cursor = "pointer";

    closeBtn.addEventListener("click", () => {
      alertBox.style.display = "none";
    });

    alertBox.appendChild(closeBtn);
  }

  // click to copy IP Address 
  const ipValue = document.querySelector(".info-grid .info-box .value");
  if (ipValue) {
    ipValue.style.cursor = "pointer";
    ipValue.title = "Click to copy IP";

    ipValue.addEventListener("click", async () => {
      const ip = ipValue.textContent.trim();

      try {
        await navigator.clipboard.writeText(ip);
        alert("IP address copied: " + ip);
      } catch (err) {
        alert("Copy this IP address: " + ip);
      }
    });
  }
});
