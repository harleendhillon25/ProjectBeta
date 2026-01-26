const apiKey = "HarleenKaurDhillon";

const apiKeyDisplay = document.getElementById("apiKeyDisplay");
const toggleKeyBtn = document.getElementById("toggleKeyBtn");
const copyKeyBtn = document.getElementById("copyKeyBtn");

let visible = false;
let hideTimer = null;

/* Function making the API key visible or hide */
toggleKeyBtn.addEventListener("click", () => {
  if (visible) {
    apiKeyDisplay.textContent = "...............";
    toggleKeyBtn.textContent = "Show";
    visible = false;

/* Times out after 5 seconds */
    if (hideTimer) clearTimeout(hideTimer);
  } else {
    apiKeyDisplay.textContent = apiKey;
    toggleKeyBtn.textContent = "Hide";
    visible = true;

    if (hideTimer) clearTimeout(hideTimer);
    
    hideTimer = setTimeout(() => {
        apiKeyDisplay.textContent = "................";
        toggleKeyBtn.textContent = "Show";
        visible = false;
    }, 5000);
  }
});

/* Coping the API Key into users clipbaord / message will show once copied*/
copyKeyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(apiKey);

  const oldText = copyKeyBtn.textContent;
  copyKeyBtn.textContent = "Copied!";
  copyKeyBtn.disabled = true;

  setTimeout(() => {
    copyKeyBtn.textContent = oldText;
    copyKeyBtn.disabled = false;
  }, 2000);
});
