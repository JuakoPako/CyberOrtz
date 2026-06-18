class Arriendo {
    constructor(id, estacionId, horas, horaInicio, horaFin, estado) {
        this.id = id;
        this.estacionId = estacionId;
        this.horas = horas;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.estado = estado;
    }
}

module.exports = Arriendo;