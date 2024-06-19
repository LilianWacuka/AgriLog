const express = require("express");
const router = express.Router();
const db = require("../mysql2"); 

router.post("/register", async (req, res) => {
  const { user_name, password, email, full_name } = req.body;

  try {
    const query = "SELECT * FROM users WHERE email_address = ?";
    db.query(query, [email], (err, data) => {
      if (err) return res.status(400).json({ message: "There was an error" });

      if (data.length != 0) {
        return res.status(400).json({ message: "This user already exists" });
      }

      const addNew = `
        INSERT INTO users (user_name, password, email_address, full_name)
        VALUES (?, ?, ?, ?)
      `;
      db.query(
        addNew,
        [user_name, password, email, full_name],
        (err, result) => {
          if (err)
            return res.status(400).json({ message: "Error adding new user" });
          return res
            .status(200)
            .json({ message: "User registered successfully" });
        }
      );
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
