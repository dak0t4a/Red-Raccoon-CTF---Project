const express = require('express');
const router = express.Router();
const pool = require('./db'); // Importa la conexión a la base de datos desde db.js

// Ruta para obtener los puntajes ordenados
router.get('/hackerboard', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT username, puntos, rango, retos_resueltos 
             FROM users 
             ORDER BY puntos DESC 
             LIMIT 10`
        );
        
        res.json(rows); // Enviamos la lista de puntajes como JSON
    } catch (error) {
        console.error('Error al obtener los puntajes:', error);
        res.status(500).json({ error: 'Error al obtener los puntajes' });
    }
});

module.exports = router;
