const db = require('../config/db');

const IVA = 0.19;

const obtenerResumen = (req, res) => {
        


    const sqlTotalEstaciones = `SELECT COUNT(*) AS total FROM estaciones`;


    const sqlDisponibles = `SELECT COUNT(*) AS total FROM estaciones WHERE disponible = TRUE`;


    const sqlOcupadas = `SELECT COUNT(*) AS total FROM estaciones WHERE disponible = FALSE`;

    const sqlArriendosMes = `
        SELECT a.horas, e.precio_hora FROM arriendos a JOIN estaciones e ON e.id = a.estacion_id
        WHERE a.estado = 'finalizado' AND MONTH(a.hora_inicio) = MONTH(CURDATE()) AND YEAR(a.hora_inicio) = YEAR(CURDATE())
    `;

    const sqlArriendosTotal = `
        SELECT a.horas, e.precio_hora FROM arriendos a JOIN estaciones e ON e.id = a.estacion_id
        WHERE a.estado = 'finalizado'
    `;

    const sqlEstaciones = `SELECT id, nombre, tipo, plataforma, precio_hora, disponible FROM estaciones`;

    db.query(sqlTotalEstaciones, (err1, filasTotal) => {
        if (err1) {
        res.status(500).json({ error: 'Error al obtener total de estaciones' });
        return;
        }

        db.query(sqlDisponibles, (err2, filasDisponibles) => {
        if (err2) {
            res.status(500).json({ error: 'Error al obtener estaciones disponibles' });
            return;
        }

        db.query(sqlOcupadas, (err3, filasOcupadas) => {
            if (err3) {
            res.status(500).json({ error: 'Error al obtener estaciones ocupadas' });
            return;
            }

            db.query(sqlArriendosMes, (err4, arriendosMes) => {
            if (err4) {
                res.status(500).json({ error: 'Error al obtener recaudación del mes' });
                return;
            }

            db.query(sqlArriendosTotal, (err5, arriendosTotal) => {
                if (err5) {
                res.status(500).json({ error: 'Error al obtener recaudación total' });
                return;
                }

                db.query(sqlEstaciones, (err6, estaciones) => {
                if (err6) {
                    res.status(500).json({ error: 'Error al obtener estaciones' });
                    return;
                }


                let subtotalMes = 0;
                for (let i = 0; i < arriendosMes.length; i++) {
                    subtotalMes = subtotalMes + (arriendosMes[i].horas * arriendosMes[i].precio_hora);
                }


                let subtotalTotal = 0;
                for (let i = 0; i < arriendosTotal.length; i++) {
                    subtotalTotal = subtotalTotal + (arriendosTotal[i].horas * arriendosTotal[i].precio_hora);
                }

                const ranking = [];
                let estacionesProcesadas = 0;

                if (estaciones.length === 0) {
                    enviarRespuesta();
                    return;
                }

                for (let i = 0; i < estaciones.length; i++) {
                    const estacion = estaciones[i];

                    const sqlArriendosEstacion = `
                    SELECT horas
                    FROM arriendos
                    WHERE estacion_id = ? AND estado = 'finalizado'
                    `;

                    db.query(sqlArriendosEstacion, [estacion.id], (err7, arriendosEstacion) => {
                    if (err7) {
                        res.status(500).json({ error: 'Error al obtener arriendos de la estación' });
                        return;
                    }

                    let horasArrendadas = 0;
                    for (let j = 0; j < arriendosEstacion.length; j++) {
                        horasArrendadas = horasArrendadas + arriendosEstacion[j].horas;
                    }

                    const subtotalGenerado = horasArrendadas * estacion.precio_hora;

                    ranking.push({
                        id: estacion.id,
                        nombre: estacion.nombre,
                        tipo: estacion.tipo,
                        plataforma: estacion.plataforma,
                        disponible: !!estacion.disponible,
                        totalArriendos: arriendosEstacion.length,
                        horasArrendadas: horasArrendadas,
                        subtotalGenerado: subtotalGenerado,
                        ivaGenerado: subtotalGenerado * IVA,
                        totalGenerado: subtotalGenerado * (1 + IVA)
                    });

                    estacionesProcesadas = estacionesProcesadas + 1;

                    if (estacionesProcesadas === estaciones.length) {
                        enviarRespuesta();
                    }
                    });
                }

                function enviarRespuesta() {
                    
                    ranking.sort((a, b) => b.subtotalGenerado - a.subtotalGenerado);

                    res.json({
                    estaciones: {
                        total: filasTotal[0].total,
                        disponibles: filasDisponibles[0].total,
                        ocupadas: filasOcupadas[0].total
                    },
                    recaudacionMes: {
                        subtotal: subtotalMes,
                        iva: subtotalMes * IVA,
                        total: subtotalMes * (1 + IVA),
                        cantidadArriendos: arriendosMes.length
                    },
                    recaudacionTotal: {
                        subtotal: subtotalTotal,
                        iva: subtotalTotal * IVA,
                        total: subtotalTotal * (1 + IVA),
                        cantidadArriendos: arriendosTotal.length
                    },
                    ranking: ranking
                    });
                }
                });
            });
            });
        });
        });
    });
};

module.exports = { obtenerResumen };