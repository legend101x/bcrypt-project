// Import required packages
const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, etc.)
app.use(express.static(path.join(__dirname)));

// File to save users
const USERS_FILE = path.join(__dirname, "users.json");

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// Signup route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send("Username and password are required.");
  }

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  }

  if (users.find(u => u.username === username)) {
    return res.send("User already exists, please login.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.send("Signup successful. You can login now!");
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let users = [];
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  }

  const user = users.find(u => u.username === username);
  if (!user) return res.send("User not found.");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.send("Incorrect password.");

  res.send(`Welcome back, ${username}!`);
});

// Port setup (Render uses process.env.PORT automatically)
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
