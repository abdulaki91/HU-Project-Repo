// Connection test utility for debugging API connectivity

export const testConnection = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  console.log("🔄 Testing API connection...");
  console.log("API URL:", apiUrl);
  console.log("Environment:", import.meta.env.VITE_NODE_ENV);

  try {
    // Test basic connectivity
    const healthResponse = await fetch(apiUrl.replace("/api", "/health"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Backend health check passed:", healthData);
    } else {
      console.error("❌ Backend health check failed:", healthResponse.status);
    }

    // Test API endpoint
    const pingResponse = await fetch(apiUrl.replace("/api", "/ping"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (pingResponse.ok) {
      const pingData = await pingResponse.json();
      console.log("✅ Backend ping successful:", pingData);
      return true;
    } else {
      console.error("❌ Backend ping failed:", pingResponse.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    console.log("💡 Troubleshooting tips:");
    console.log(
      "1. Make sure backend server is running on http://localhost:5000",
    );
    console.log("2. Check if CORS is properly configured");
    console.log("3. Verify .env file has correct VITE_API_URL");
    console.log(
      "4. Try accessing http://localhost:5000/health directly in browser",
    );
    return false;
  }
};

export const debugApiConfig = () => {
  console.log("🔍 API Configuration Debug:");
  console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
  console.log("VITE_NODE_ENV:", import.meta.env.VITE_NODE_ENV);
  console.log("All env vars:", import.meta.env);
};
