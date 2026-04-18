#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const mode = process.argv[2];

if (!mode || !["standalone", "full"].includes(mode)) {
  console.log("Usage: node switch-mode.js [standalone|full]");
  console.log("");
  console.log("Modes:");
  console.log("  standalone - Demo mode without backend dependency");
  console.log("  full       - Full application with backend integration");
  process.exit(1);
}

const mainJsPath = path.join(__dirname, "src", "main.jsx");
let content = fs.readFileSync(mainJsPath, "utf8");

if (mode === "standalone") {
  content = content.replace(
    'import App from "./App.jsx";',
    'import App from "./App-standalone.jsx";',
  );
  console.log("✅ Switched to standalone mode (no backend required)");
  console.log("   Run: npm run build && npm run preview");
} else {
  content = content.replace(
    'import App from "./App-standalone.jsx";',
    'import App from "./App.jsx";',
  );
  console.log("✅ Switched to full mode (requires backend server)");
  console.log(
    "   Make sure backend is running at: https://huprojectrepo-backend.abdulaki.com",
  );
}

fs.writeFileSync(mainJsPath, content);
console.log("   Changes saved to main.jsx");
