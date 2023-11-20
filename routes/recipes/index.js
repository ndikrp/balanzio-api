const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const router = express.Router();

dotenv.config();

const pool = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

//-----------------------------------/list--------------------------------//

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

//-----------------------------------/recipe--------------------------------//

router.post('/recipe/:userId', (req, res) => {
  const userId = req.params.userId;
  const { recipe_id } = req.body;

  if (!recipe_id) {
    return res.status(400).json({ error: 'Recipe ID is required' });
  }

  // Check if the combination of userId and recipe_id already exists in favorites
  const checkDuplicateQuery = 'SELECT * FROM favorites WHERE userId = ? AND recipe_id = ?';
  pool.query(checkDuplicateQuery, [userId, recipe_id], (duplicateErr, duplicateResults) => {
    if (duplicateErr) {
      console.error('Error checking for duplicate:', duplicateErr);
      return res.status(500).json({ error: 'Error checking for duplicate.' });
    }

    if (duplicateResults.length > 0) {
      // If the combination already exists, you can choose how to handle it.
      // Here, I'm sending a 400 Bad Request response.
      return res.status(400).json({ error: 'Recipe is already a favorite for this user.' });
    }

    // Continue with the insertion since it's not a duplicate
    const getFoodNameQuery = 'SELECT name FROM recipes WHERE recipe_id = ?';

    pool.query(getFoodNameQuery, [recipe_id], (err, results) => {
      if (err) {
        console.error('Error retrieving name from recipes:', err);
        return res.status(500).json({ error: 'Error retrieving name from recipes.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      const food_name = results[0].name;

      const addFavoriteQuery = 'INSERT INTO favorites (userId, recipe_id, food_name, add_at) VALUES (?, ?, ?, CURDATE())';
      const values = [userId, recipe_id, food_name];

      pool.query(addFavoriteQuery, values, (addErr, result) => {
        if (addErr) {
          console.error('Error adding favorite recipe:', addErr);
          return res.status(500).json({ error: 'Error adding favorite recipe.' });
        }

        res.json({ message: 'Favorite recipe added successfully', result });
      });
    });
  });
});

router.get('/recipe/favorites/:userId', (req, res) => {
  const userId = req.params.userId;

  const getFavoritesQuery = 'SELECT * FROM favorites WHERE userId = ?';

  pool.query(getFavoritesQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error retrieving favorites:', err);
      return res.status(500).json({ error: 'Error retrieving favorites.' });
    }

    res.json({ favorites: results });
  });
});

module.exports = router;
