// Simple test script to verify signup functionality
const axios = require("axios");

const testSignup = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/user/register",
      {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "password123",
        role: "student",
        batch: "2024",
        department: "Computer Science",
      },
    );

    console.log("✅ Signup successful:", response.data);
  } catch (error) {
    console.log("❌ Signup failed:", error.response?.data || error.message);
  }
};

// Test ping endpoint first
const testPing = async () => {
  try {
    const response = await axios.get("http://localhost:5000/ping");
    console.log("✅ Backend is running:", response.data);
    return true;
  } catch (error) {
    console.log("❌ Backend not reachable:", error.message);
    return false;
  }
};

const runTests = async () => {
  console.log("Testing backend connection...");
  const isRunning = await testPing();

  if (isRunning) {
    console.log("\nTesting signup...");
    await testSignup();
  }
};

runTests();
