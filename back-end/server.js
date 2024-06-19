// server.js
const express = require("express");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const { check, validationResult } = require("express-validator");
const app = express();
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

// Configure session middleware
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE_NAME,
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:" + err.stack);
    return;
  }
  console.log("Connected to MySQL as id " + connection.threadId);
});

// Middleware to parse incoming JSON data
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "static")));

// Define routes for serving HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "'pages', 'index.html'"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "./pages/register.html"));
});

// Define a User object with methods for database operations
const User = {
  tablename: "users",
  createUser: function (newUser, callback) {
    connection.query(
      "INSERT INTO " + this.tablename + " SET ?",
      newUser,
      callback
    );
  },
  getUserByEmail: function (email, callback) {
    connection.query(
      "SELECT * FROM " + this.tablename + " WHERE email = ?",
      [email],
      callback
    );
  },
  getUserByUsername: function (username, callback) {
    connection.query(
      "SELECT * FROM " + this.tablename + " WHERE username = ?",
      [username],
      callback
    );
  },
};

// Registration route
app.post(
  "/register",
  [
    check("email").isEmail().withMessage("Invalid email address"),
    check("username")
      .isAlphanumeric()
      .withMessage("Username must be alphanumeric"),
    check("email").custom(async (value) => {
      return new Promise((resolve, reject) => {
        User.getUserByEmail(value, (err, user) => {
          if (err) reject(err);
          if (user.length > 0) reject(new Error("Email already exists"));
          resolve(true);
        });
      });
    }),
    check("username").custom(async (value) => {
      return new Promise((resolve, reject) => {
        User.getUserByUsername(value, (err, user) => {
          if (err) reject(err);
          if (user.length > 0) reject(new Error("Username already exists"));
          resolve(true);
        });
      });
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = {
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
      full_name: req.body.full_name,
    };

    User.createUser(newUser, (error, results) => {
      if (error) {
        console.error("Error inserting user:", error.message);
        return res.status(500).json({ error: error.message });
      }
      console.log("User created successfully with id:", results.insertId);
      res.status(201).redirect("/login");
    });
  }
);

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.getUserByUsername(username, (err, results) => {
    if (err) {
      console.error("Error fetching user:", err.message);
      return res.status(500).send("An error occurred");
    }
    if (results.length === 0) {
      console.error("Invalid username or password");
      return res.status(401).send("Invalid username or password");
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err.message);
        return res.status(500).send("An error occurred");
      }
      if (isMatch) {
        req.session.user = user;
        console.log("User logged in successfully:", user.username);
        res.redirect("/dashboard");
      } else {
        console.error("Invalid username or password");
        res.status(401).send("Invalid username or password");
      }
    });
  });
});

// Dashboard route
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("You must log in first");
  }
  res.send(`Welcome to the dashboard, ${req.session.user.username}`);
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy();
  console.log("User logged out successfully");
  res.send("Logout successful");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
