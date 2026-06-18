const db = require('../config/db');
const Estacion = require('../model/Estacion');

const listar = (req, res) => {
  db.query('SELECT * FROM estaciones', (err, filas) => {
    if (err) {
      res.status(500).json({ error: 'Error al listar estaciones' });
      return;
    }

    const estaciones = [];
    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      const estacion = new Estacion(
        fila.id,
        fila.nombre,
        fila.tipo,
        fila.plataforma,
        fila.precio_hora,
        fila.disponible,
        fila.descripcion
      );
      estaciones.push(estacion);
    }

    res.json(estaciones);
  });
};


const agregar = (req, res) => {
  const nombre = req.body.nombre;
  const tipo = req.body.tipo;
  const plataforma = req.body.plataforma;
  const precioHora = req.body.precioHora;
  const disponible = req.body.disponible;
  const descripcion = req.body.descripcion;

  if (!nombre || !tipo || !plataforma || !precioHora) {
    res.status(400).json({ error: 'Nombre, tipo, plataforma y precio son obligatorios' });
    return;
  }

  db.query(
    'INSERT INTO estaciones (nombre, tipo, plataforma, precio_hora, disponible, descripcion) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, tipo, plataforma, precioHora, disponible, descripcion],
    (err, resultado) => {
      if (err) {
        res.status(500).json({ error: 'Error al agregar estación' });
        return;
      }
      const nueva = new Estacion(resultado.insertId, nombre, tipo, plataforma, precioHora, disponible, descripcion);
      res.status(201).json(nueva);
    }
  );
};


const editar = (req, res) => {
  const id = req.params.id;
  const nombre = req.body.nombre;
  const tipo = req.body.tipo;
  const plataforma = req.body.plataforma;
  const precioHora = req.body.precioHora;
  const disponible = req.body.disponible;
  const descripcion = req.body.descripcion;

  if (!nombre || !tipo || !plataforma || !precioHora) {
    res.status(400).json({ error: 'Nombre, tipo, plataforma y precio son obligatorios' });
    return;
  }

  db.query(
    'UPDATE estaciones SET nombre = ?, tipo = ?, plataforma = ?, precio_hora = ?, disponible = ?, descripcion = ? WHERE id = ?',
    [nombre, tipo, plataforma, precioHora, disponible, descripcion, id],
    (err, resultado) => {
      if (err) {
        res.status(500).json({ error: 'Error al editar estación' });
        return;
      }
      if (resultado.affectedRows === 0) {
        res.status(404).json({ error: 'Estación no encontrada' });
        return;
      }
      res.json(new Estacion(id, nombre, tipo, plataforma, precioHora, disponible, descripcion));
    }
  );
};


const eliminar = (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM estaciones WHERE id = ?', [id], (err, resultado) => {
    if (err) {
      res.status(500).json({ error: 'Error al eliminar estación' });
      return;
    }
    if (resultado.affectedRows === 0) {
      res.status(404).json({ error: 'Estación no encontrada' });
      return;
    }
    res.json({ mensaje: 'Estación eliminada correctamente' });
  });
};

module.exports = { listar, agregar, editar, eliminar };