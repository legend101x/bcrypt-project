const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 7000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // so HTML + CSS can be served

const USERS_FILE = "users.json";

// Make sure users.json exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Route: Signup Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

// Route: Login Page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// Signup POST
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  const userExists = users.find(u => u.username === username);

  if (userExists) {
    return res.send("⚠ Username already exists. Try another.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));

  res.send("✅ Signup successful! <a href='/login'>Go to login</a>");
});

// Login POST
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let users = JSON.parse(fs.readFileSync(USERS_FILE));
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.send("❌ User not found. Please <a href='/'>signup</a>");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.send("❌ Wrong password.");
  }

  res.send("🎉 Login successful! Welcome, " + username);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
