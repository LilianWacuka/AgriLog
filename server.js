const express = require("express");
const fs = require("fs");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const { check, validationResult } = require("express-validator");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Configure session middleware
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
console.log(process.env.HOST)

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

// Authenctication Middleware
function isAuthenticated(req, res, next) {
  if(req.session.user) {
    return next();
  }
  // return window.location = '/login'
  res.sendFile(path.join(__dirname, "./pages/register.html"));
}

// Serve static files
app.use(express.static(path.join(__dirname, "static")));

// Define routes for serving HTML pages
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "./pages/register.html"));
});
// Route for index page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "./pages/index.html"));
});
// Route for dashboard
app.get("/",isAuthenticated ,(req, res) => {
  res.sendFile(path.join(__dirname, "./pages/dashboard.html"));
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
  "/api/register",
  [
    check("email").isEmail().withMessage("Invalid email address"),
    check("username")
      .isAlphanumeric()
      .withMessage("Username must be alphanumeric"),
    check("email").custom((value) => {
      return new Promise((resolve, reject) => {
        User.getUserByEmail(value, (err, user) => {
          if (err) return reject(err);
          if (user.length > 0) return reject(new Error("Email already exists"));
          resolve(true);
        });
      });
    }),
    check("user_name").custom((value) => {
      return new Promise((resolve, reject) => {
        User.getUserByUsername(value, (err, user) => {
          if (err) return reject(err);
          if (user.length > 0) return reject(new Error("Username already exists"));
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

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      console.log (req.body)

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
        res.status(200).json("User successfully registered")
      });
    } catch (error) {
      console.error("Error during user registration:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)

  User.getUserByUsername(username, (err, results) => {
    if (err) {
      console.error("Error fetching user:", err.message);
      return res.status(500).json({ error: "An error occurred" });
    }
    if (results.length === 0) {
      console.error("Invalid username or password");
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    console.log(user);
    const isok= bcrypt.compare(password, user.password)
  
   
      if (isok) {
        req.session.user = user;
        console.log("User logged in successfully:", user.username);
        return res.status(200).json({ message: "Login successful" });
      } else {
        console.error("Invalid username or password");
        return res.status(401).json({ error: "Invalid username or password" });
      }
    });
  });

// Dashboard route
app.get("/api/dashboard", (req, res) => {
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

// Catch-all route to handle requests and send a 404 error
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});