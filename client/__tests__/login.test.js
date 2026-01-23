describe("login.js", () => {
  beforeEach(() => {
    jest.resetModules();

    document.body.innerHTML = `
      <form id="login-form">
        <input name="email" value="harleenkaur@exampl.com" />
        <input name="password" value="123456" />
        <button type="submit">Login</button>
      </form>

      <a id="forgot-password" href="#">Forgot Password?</a>
    `;

    global.fetch = jest.fn();
    window.alert = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => { });
    delete window.__REDIRECT_TO__;

    require("../js/login.js");
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test("successful login redirects to index.html", async () => {
    fetch.mockResolvedValue({
      status: 200,
      json: async () => ({}),
    });

    document
      .getElementById("login-form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));


    await Promise.resolve();
    await Promise.resolve();

    expect(window.__REDIRECT_TO__).toBe("index.html");
  });

  test("failed login shows alert", async () => {
    fetch.mockResolvedValue({
      status: 401,
      json: async () => ({}),
    });

    document
      .getElementById("login-form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await Promise.resolve();
    await Promise.resolve();

    expect(window.alert).toHaveBeenCalledWith("Login failed. Please try again.");
  });

  test("forgot password shows correct message", () => {
    document
      .getElementById("forgot-password")
      .dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(window.alert).toHaveBeenCalledWith(
      "Your request has been sent to the administrator.\n\nThey will reset your password and email you shortly."
    );
  });

  test("does not crash if elements are missing", () => {
    jest.resetModules();
    document.body.innerHTML = ``;

    expect(() => require("../js/login.js")).not.toThrow();
  });
});
