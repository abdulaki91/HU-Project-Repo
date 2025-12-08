const fs = require("fs");
const path = require("path");
const file = path.join(
  __dirname,
  "..",
  "Frontend",
  "src",
  "pages",
  "Profile.jsx"
);
const s = fs.readFileSync(file, "utf8");
const pairs = { ")": "(", "}": "{", "]": "[" };
const opens = new Set(["(", "{", "["]);
const closes = new Set([")", "}", "]"]);
let stack = [];
let line = 1,
  col = 0;
for (let i = 0; i < s.length; i++) {
  const c = s[i];
  if (c === "\n") {
    line++;
    col = 0;
    continue;
  }
  col++;
  if (opens.has(c)) stack.push({ ch: c, i, line, col });
  else if (closes.has(c)) {
    if (stack.length === 0) {
      console.log(
        `Unmatched closing ${c} at index ${i} (line ${line}, col ${col})`
      );
      process.exit(1);
    }
    const last = stack.pop();
    if (last.ch !== pairs[c]) {
      console.log("--- MISMATCH FOUND ---");
      console.log(
        `Last open: ${last.ch} at index ${last.i} (line ${last.line}, col ${last.col})`
      );
      console.log(
        `Closing char: ${c} at index ${i} (line ${line}, col ${col})`
      );
      const start = Math.max(0, last.i - 40);
      const end = Math.min(s.length, i + 40);
      console.log("--- CONTEXT AROUND OPENING ---");
      console.log(s.slice(start, last.i + 40));
      console.log("--- CONTEXT AROUND CLOSING ---");
      console.log(s.slice(i - 40, end));
      process.exit(1);
    }
  }
}
if (stack.length) {
  console.log(`Unmatched opening tokens (${stack.length}). Showing last 5:`);
  console.log(
    stack
      .slice(-5)
      .map((t) => `${t.ch} at index ${t.i} (line ${t.line}, col ${t.col})`)
      .join("\n")
  );
  process.exit(1);
}
console.log("All brackets balanced.");
