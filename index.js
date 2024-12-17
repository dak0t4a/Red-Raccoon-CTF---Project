const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const pool = require('./db'); // Conexión a la base de datos
const loginRoutes = require('./login'); // Ruta para login
const registerRoutes = require('./register'); // Ruta para registro
const { startContainer, stopContainer } = require('./dockerManager');

const app = express();
// Configuración de sesiones
app.use(session({
    secret: 'mi_secreto', // Cambia esta clave por algo más seguro
    resave: false,
    saveUninitialized: true,
}));

app.use(bodyParser.json());
app.use(express.static('public')); // Sirve archivos estáticos, como HTML, CSS y JS

// Rutas de autenticación
app.use('/auth', loginRoutes); // Para /auth/login
app.use('/auth', registerRoutes); // Para /auth/register

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
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

// Ruta para verificar el código y sumar puntos
app.post('/checkCode', async (req, res) => {
  const { code, retoId } = req.body;

  console.log('Código recibido:', code);
  console.log('ID del reto recibido:', retoId);

  // Verificar que el usuario está logueado
  if (!req.session.user) {
    return res.status(401).json({ error: 'No estás logueado' });
  }

  try {
    // Obtener la bandera del reto desde la base de datos
    const [rows] = await pool.query('SELECT user_flag, puntos FROM retos WHERE id = ?', [retoId]);

    // Si no se encuentra el reto, devolver un error
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reto no encontrado' });
    }

    const reto = rows[0];

    // Imprimir la bandera almacenada en la base de datos para depurar
    console.log('Bandera almacenada en la base de datos:', reto.user_flag);

    // Comparar la bandera proporcionada con la almacenada en la base de datos
    if (code === reto.user_flag) {
      // Verificar si el usuario ya resolvió este reto
      const [result] = await pool.query('SELECT * FROM usuarios_retos WHERE usuario_id = ? AND reto_id = ?', [req.session.user.id, retoId]);

      if (result.length > 0) {
        // El usuario ya resolvió este reto
        return res.status(400).json({ error: 'Ya resolviste este reto y no puedes reclamar los puntos de nuevo' });
      }

      // Sumar los puntos al usuario
      const [updateResult] = await pool.query('UPDATE users SET puntos = puntos + ? WHERE id = ?', [reto.puntos, req.session.user.id]);

      // Registrar que el usuario ha resuelto el reto
      await pool.query('INSERT INTO usuarios_retos (usuario_id, reto_id) VALUES (?, ?)', [req.session.user.id, retoId]);
      await pool.query('UPDATE users SET retos_resueltos = retos_resueltos + 1 WHERE id = ?', [req.session.user.id]);
      // Actualizar la información del usuario en la sesión
      req.session.user.puntos += reto.puntos;

      res.json({
        message: 'Código correcto, se han añadido ' + reto.puntos + ' puntos',
        puntos: req.session.user.puntos
      });
    } else {
      // La bandera es incorrecta
      res.status(400).json({ error: 'Código incorrecto' });
    }
  } catch (error) {
    console.error('Error al verificar el código:', error);
    res.status(500).json({ error: 'Error al verificar el código' });
  }
});


// Rutas para manejar Docker (esto depende de tu configuración)
app.post('/start', async (req, res) => {
    try {
        const result = await startContainer();
        res.json({ message: 'Contenedor iniciado', containerId: result.containerId, ip: result.ip });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/stop', async (req, res) => {
    try {
        const result = await stopContainer();
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Mostrar el tablero de usuarios (ordenados por puntos)
app.get('/hackerboard', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY puntos DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Configurar puerto y escuchar peticiones
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


