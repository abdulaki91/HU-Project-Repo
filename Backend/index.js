// Load environment variables
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
dotenv.config();

import userRoute from "./routes/userRoute.js";
import projectRoute from "./routes/projectRoute.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

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
