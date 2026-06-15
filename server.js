const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const estacionController = require('./controllers/estacionController');
const inicioSesionController = require('./controllers/InicioSesionController');

// Permite leer JSON en el body de las peticiones
app.use(express.json());

// Sirve archivos estáticos (css, js, img) desde /public
app.use(express.static(path.join(__dirname, 'public')));

// ── Rutas para servir las páginas HTML (vistas) ──────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'panel.html'));
});

// ── Rutas de la API: Estaciones (CRUD) ────────────────────
app.get('/api/estaciones', estacionController.listar);
app.post('/api/estaciones', estacionController.agregar);
app.put('/api/estaciones/:id', estacionController.editar);
app.delete('/api/estaciones/:id', estacionController.eliminar);

// ── Ruta de la API: Login ──────────────────────────────────
app.post('/api/login', inicioSesionController.iniciarSesion);

app.listen(PORT, () => {
  console.log(`🎮 CyberOrtz corriendo en http://localhost:${PORT}`);
});