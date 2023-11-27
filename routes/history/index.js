const express = require('express');
const router = express.Router();
const pool = require('../../config/database.js');

router.get('/history', (req, res) => {
    const selectHistorySql = 'SELECT * FROM history';

    pool.query(selectHistorySql, (error, results) => {
        if (error) {
            console.error('Error querying history:', error);
            return res.status(500).json({ error: 'Error querying history' });
        }
        res.json({ status: 'Success', food: results });
    });
});

module.exports = router;