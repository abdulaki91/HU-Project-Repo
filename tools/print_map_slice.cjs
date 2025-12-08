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
const startMarker = "userProjects.map((project) => (";
const start = s.indexOf(startMarker);
if (start === -1) {
  console.log("start not found");
  process.exit(1);
}
const endMarker = "))}\n            </TabsContent>";
const end = s.indexOf("))}", start);
console.log("start index", start);
console.log("end index", end);
console.log(s.slice(start, end + 3));
