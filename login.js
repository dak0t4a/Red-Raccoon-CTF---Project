const express = require('express');
const bcrypt = require('bcrypt'); // Importar bcrypt para comparar contraseñas
const pool = require('./db'); // Conexión a la base de datos

const router = express.Router(); // Definir el router correctamente

// Inicio de sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Verificar conexión a la base de datos
        await pool.query('SELECT 1');
        console.log('Conexión con la base de datos exitosa.');

        // Buscar al usuario por nombre de usuario
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (user) {
            // Comparar la contraseña proporcionada con el hash almacenado
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Guardar la información del usuario en la sesión
                req.session.user = user;
                res.redirect('/dockerManager.html');
            } else {
                res.status(401).json({ error: 'Credenciales inválidas' });
            }
        } else {
            res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('Error: No se puede conectar a la base de datos.');
        } else {
            console.error('Error al iniciar sesión:', error);
        }
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router; // Exportar el router
