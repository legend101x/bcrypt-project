// Import dependencies
const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();

// Middleware to handle form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// ---------------- ROUTES ----------------

// Home (Signup Page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

// Login Page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// ---------------- USER LOGIC ----------------

// File to store users
const USERS_FILE = path.join(__dirname, "users.json");

// Handle Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send("Please provide both username and password.");
  }

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  }

  // Check if username exists
  if (users.find(u => u.username === username)) {
    return res.send("Username already exists. Please login.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  // Save user
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.send("Signup successful! You can now login.");
});

// Handle Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  }

  const user = users.find(u => u.username === username);
  if (!user) return res.send("User not found!");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.send("Invalid password!");

  res.send(`Welcome back, ${username}!`);
});

// ---------------- SERVER START ----------------

// ✅ Works locally on 7000, but Render replaces it with process.env.PORT
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
