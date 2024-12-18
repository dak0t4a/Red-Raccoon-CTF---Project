const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db');

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    const { nickname, email, password } = req.body;

    try {
        // Verificar si el nickname ya está registrado
        const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [nickname]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'El nickname ya está en uso.' });
        }

        // Insertar el nuevo usuario con rango y retos_resueltos por defecto
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password, puntos, rango, retos_resueltos) VALUES (?, ?, ?, 0, "script_kiddle", 0)',
            [nickname, email, hashedPassword]
        );

        res.json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
        console.log('Usuario agregado exitosamente');
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

module.exports = router;
