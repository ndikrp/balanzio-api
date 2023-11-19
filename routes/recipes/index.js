const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const router = express.Router();

dotenv.config();

const pool = mysql.createConnection({
    host: '34.101.111.175',
    user: 'root',
    database: 'balanziov1',
    password: ''
});

// API endpoint to get all recipes
router.get('/list', (req, res) => {
  const selectRecipesSql = 'SELECT * FROM recipes';

  pool.query(selectRecipesSql, (error, results) => {
    if (error) {
      console.error('Error querying recipes:', error);
      return res.status(500).json({ error: 'Error querying recipes' });
    }

    res.json({ recipes: results });
  });
});

module.exports = router;
