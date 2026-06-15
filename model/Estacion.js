class Estacion {
  constructor(id, nombre, tipo, plataforma, precioHora, disponible, descripcion) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.plataforma = plataforma;
    this.precioHora = precioHora;
    this.disponible = disponible;
    this.descripcion = descripcion;
  }
}

module.exports = Estacion;