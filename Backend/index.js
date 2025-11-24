// Load environment variables
import dotenv from "dotenv";
dotenv.config();

import express from "express";

import userRoute from "./routes/userRoute.js";
import projectRoute from "./routes/projectRoute.js";

const app = express();

app.use(express.json());

// // --- Routes ---
app.use("/api/user", userRoute);
app.use("/api/project", projectRoute);

// --- Ping route for testing backend reachability ---
app.get("/ping", (req, res) => {
  res.json({ msg: "pong from Node.js backend" });
});

// --- Start server ---
// Passenger ignores the port, but this works locally
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(` Server running on PORT: ${port}`);
});
