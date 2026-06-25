const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const estacionController = require('./controllers/estacionController');
const inicioSesionController = require('./controllers/InicioSesionController');
const arriendoController = require('./controllers/arriendoController');
const dashboardController = require('./controllers/dashboardController');

app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'panel.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

app.get('/api/estaciones', estacionController.listar);
app.post('/api/estaciones', estacionController.agregar);
app.put('/api/estaciones/:id', estacionController.editar);
app.delete('/api/estaciones/:id', estacionController.eliminar);

app.get('/api/arriendos', arriendoController.listar);
app.post('/api/arriendos', arriendoController.iniciar);
app.put('/api/arriendos/:id/finalizar', arriendoController.finalizar);

app.get('/api/dashboard',dashboardController.obtenerResumen);

app.post('/api/login', inicioSesionController.iniciarSesion);

app.listen(PORT, () => {
  console.log(`CyberOrtz corriendo`);
});