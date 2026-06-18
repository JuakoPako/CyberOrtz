const db = require('../config/db');
const Arriendo = require('../model/Arriendo');

const listar = (req, res) => {
    const sqlCerrarVencidos = `
    UPDATE arriendos
    SET estado = 'finalizado'
    WHERE estado = 'activo' AND hora_fin < NOW()
    `;

    db.query(sqlCerrarVencidos, (err) => {
        if (err) {
            res.status(500).json({ error: 'Error al revisar arriendos vencidos' });
            return;
        }

        const sqlLiberarEstaciones = `
        UPDATE estaciones
        SET disponible = TRUE
        WHERE id IN (
            SELECT estacion_id FROM arriendos WHERE estado = 'finalizado'
        ) AND id NOT IN (
            SELECT estacion_id FROM arriendos WHERE estado = 'activo'
        )
        `;

        db.query(sqlLiberarEstaciones, (err2) => {
            if (err2) {
                res.status(500).json({ error: 'Error al liberar estaciones' });
                return;
            }

            db.query('SELECT * FROM arriendos ORDER BY id DESC', (err3, filas) => {
                if (err3) {
                    res.status(500).json({ error: 'Error al listar arriendos' });
                    return;
                }

                const arriendos = filas.map(
                    (fila) => new Arriendo(fila.id, fila.estacion_id, fila.horas, fila.hora_inicio, fila.hora_fin, fila.estado)
                );
                res.json(arriendos);
            });
        });
    });
};

const iniciar = (req, res) => {
    const estacionId = req.body.estacionId;
    const horas = Number(req.body.horas);

    if (!estacionId || !req.body.horas) {
        res.status(400).json({ error: 'Estación y horas son obligatorios' });
        return;
    }

    if (isNaN(horas) || horas <= 0) {
        res.status(400).json({ error: 'Las horas deben ser un número mayor a 0' });
        return;
    }
    if (horas > 12) {
        res.status(400).json({ error: 'El maximo de horas permitidas son 12' });
        return;
    }

    const sqlInsertar = `
    INSERT INTO arriendos (estacion_id, horas, hora_inicio, hora_fin, estado)
    VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? HOUR), 'activo')
    `;

    db.query(sqlInsertar, [estacionId, horas, horas], (err, resultado) => {
        if (err) {
            res.status(500).json({ error: 'Error al iniciar arriendo' });
            return;
        }

        db.query('UPDATE estaciones SET disponible = FALSE WHERE id = ?', [estacionId], (err2) => {
            if (err2) {
                res.status(500).json({ error: 'Error al actualizar estación' });
                return;
            }
            res.status(201).json({ mensaje: 'Arriendo iniciado exitosamente', id: resultado.insertId });
        });
    });
};

const finalizar = (req, res) => {
    const id = req.params.id;

    db.query(
        'SELECT * FROM arriendos WHERE id = ?',
        [id],
        (err, filas) => {
            if (err) {
                res.status(500).json({ error: 'Error al buscar el arriendo' });
                return;
            }
            if (filas.length === 0) {
                res.status(404).json({ error: 'Arriendo no encontrado' });
                return;
            }

            const arriendo = filas[0];

            if (arriendo.estado === 'finalizado') {
                res.status(400).json({ error: 'Este arriendo ya estaba finalizado' });
                return;
            }

            db.query(
                "UPDATE arriendos SET estado = 'finalizado' WHERE id = ?",
                [id],
                (err2) => {
                    if (err2) {
                        res.status(500).json({ error: 'Error al finalizar arriendo' });
                        return;
                    }

                    db.query(
                        'UPDATE estaciones SET disponible = TRUE WHERE id = ?',
                        [arriendo.estacion_id],
                        (err3) => {
                            if (err3) {
                                res.status(500).json({ error: 'Error al liberar la estación' });
                                return;
                            }
                            res.json({ mensaje: 'Arriendo finalizado exitosamente' });
                        }
                    );
                }
            );
        }
    );
};

module.exports = { listar, iniciar, finalizar };