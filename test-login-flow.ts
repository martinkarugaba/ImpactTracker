import "dotenv/config";

async function testLoginFlow() {
  try {
    console.log("🧪 Testing login flow with runtime fixes...");

    // This simulates what happens when a user tries to login
    const { login } = await import("./src/features/auth/actions/auth");

    console.log("Attempting login with test credentials...");
    const result = await login("test@example.com", "password123");

    console.log("Login result:", result);

    if (result.success) {
      console.log("✅ Login flow test successful!");
      return true;
    } else {
      console.log("❌ Login failed:", result.error);
      return false;
    }
  } catch (error) {
    console.error("❌ Login flow test failed:", error);
    return false;
  }
}

testLoginFlow()
  .then(success => {
    console.log(success ? "✅ All tests passed!" : "❌ Tests failed!");
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("Test runner failed:", error);
    process.exit(1);
  });
