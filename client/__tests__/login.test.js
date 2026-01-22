// Test for successful login

describe("Login success", () => {
  beforeEach(() => {
    // Fake login form
    document.body.innerHTML = `
      <form id="login-form">
        <input name="email" value="test@example.com" />
        <input name="password" value="123456" />
        <button type="submit">Login</button>
      </form>
    `;

    window.location = { assign: jest.fn() };

    
    window.alert = jest.fn();

   
    global.fetch = jest.fn();

    
    require("../../assets/login.js");
  });

  test("goes to index.html after login", async () => {
    
    fetch.mockResolvedValue({
      status: 200,
      json: async () => ({}),
    });

    // Submit form
    document.getElementById("login-form").dispatchEvent(
      new Event("submit")
    );

    // Wait for async code
    await Promise.resolve();

    // Check redirect
    expect(window.location.assign).toHaveBeenCalledWith("index.html");
  });
});
