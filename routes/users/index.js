const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const responseHelper = require('express-response-helper').helper();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createConnection({
    host: '34.101.111.175',
    user: 'root',
    database: 'balanziov1',
    password: ''
});

router.post('/insert', (req, res) => {
  // Extract user input from the JSON body
  const userData = req.body;

  // Example validation - make sure the required fields are present
  const requiredFields = ['name', 'weight', 'height', 'gender', 'age', 'email', 'password'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // Check if the email is already registered
  const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
  pool.query(checkEmailSql, [userData.email], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking email:', checkError);
      return res.status(500).json({ error: 'Error checking email' });
    }

    // If email already exists, return an error
    if (checkResults.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Email is unique, proceed with user insertion

    // Hash the password
    const saltRounds = 10; // Number of salt rounds for bcrypt
    bcrypt.hash(userData.password, saltRounds, (hashError, hashedPassword) => {
      if (hashError) {
        console.error('Error hashing password:', hashError);
        // Handle the error appropriately, e.g., return an error response to the client
        return res.status(500).json({ error: 'Error hashing password' });
      }

      // Use the hashed password in your database query
      const insertUserSql = 'INSERT INTO users (name, weight, height, gender, age, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
      const values = [
        userData.name,
        userData.weight,
        userData.height,
        userData.gender,
        userData.age,
        userData.email,
        hashedPassword, // Use the hashed password here
      ];

      pool.query(insertUserSql, values, (insertError, results) => {
        if (insertError) {
          console.error('Error inserting user data:', insertError);
          return res.status(500).json({ error: 'Error inserting user data' });
        }

        console.log('Inserted rows:', results.affectedRows);
        res.json({ message: 'User data inserted successfully', results });
      });
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  pool.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.error('Error querying user:', error);
      return res.status(500).json({ error: 'Error querying user' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (bcryptError, passwordMatch) => {
      if (bcryptError) {
        console.error('Error comparing passwords:', bcryptError);
        return res.status(500).json({ error: 'Error comparing passwords' });
      }

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
      console.log('Retrieved user:', user);
    });
  });
});



module.exports = router;

