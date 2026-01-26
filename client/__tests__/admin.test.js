/** @jest-environment jsdom */

describe("admin.js", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    document.body.innerHTML = `
      <div id="apiKeyDisplay">••••••••••••••••••••••••</div>
      <button id="toggleKeyBtn">Show</button>
      <button id="copyKeyBtn">Copy</button>
    `;

    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(),
    };

    require("../js/admin.js");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Show Button
  test("clicking Show displays the API key", () => {
    document.getElementById("toggleKeyBtn").click();
    
    expect(document.getElementById("apiKeyDisplay").textContent).toBe(
      "HarleenKaurDhillon"
    );
    expect(document.getElementById("toggleKeyBtn").textContent).toBe("Hide");
  });
  
  // Hiding after 5 seconds 
  test("API key hides automatically after 5 seconds", () => {
    document.getElementById("toggleKeyBtn").click();

    jest.advanceTimersByTime(5000);

    // Api Key hides again
    expect(document.getElementById("apiKeyDisplay").textContent).toBe(
      "................"
    );
    expect(document.getElementById("toggleKeyBtn").textContent).toBe("Show");
  });

  // Copy Button
  test("clicking Copy copies the API key and shows Copied! for 2 seconds", async () => {
    const copyBtn = document.getElementById("copyKeyBtn");

    copyBtn.click();
    await Promise.resolve();
 
    // API key copied 
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("HarleenKaurDhillon");
    // Button changes to Copied
    expect(copyBtn.textContent).toBe("Copied!");
    expect(copyBtn.disabled).toBe(true);

    jest.advanceTimersByTime(2000);

    //returning back to normal 
    expect(copyBtn.textContent).toBe("Copy");
    expect(copyBtn.disabled).toBe(false);
  });
});
