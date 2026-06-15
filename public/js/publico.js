const contenedor = document.getElementById('contenedor-estaciones');
const plantilla = document.getElementById('plantilla-tarjeta');
const buscador = document.getElementById('buscador');

let todasLasEstaciones = [];

const cargarEstaciones = async () => {
  try {
    const respuesta = await fetch('/api/estaciones');
    const estaciones = await respuesta.json();

    todasLasEstaciones = estaciones;
    mostrarEstaciones(estaciones);
  } catch (err) {
    contenedor.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
  }
};

const mostrarEstaciones = (estaciones) => {
  contenedor.innerHTML = '';

  if (estaciones.length === 0) {
    contenedor.innerHTML = '<p class="text-center">No hay estaciones disponibles</p>';
    return;
  }

  for (let i = 0; i < estaciones.length; i++) {
    const estacion = estaciones[i];
    const clon = plantilla.content.cloneNode(true);

    clon.querySelector('.nombre').textContent = estacion.nombre;
    clon.querySelector('.plataforma').textContent = 'Plataforma: ' + estacion.plataforma;
    clon.querySelector('.descripcion').textContent = estacion.descripcion;
    clon.querySelector('.precio').textContent = Number(estacion.precioHora).toLocaleString('es-CL');

    const badge = clon.querySelector('.estado');
    if (estacion.disponible) {
      badge.textContent = 'Disponible';
      badge.classList.add('bg-success');
    } else {
      badge.textContent = 'Ocupada';
      badge.classList.add('bg-danger');
    }

    contenedor.appendChild(clon);
  }
};

buscador.addEventListener('input', () => {
  const texto = buscador.value.toLowerCase();

  const filtradas = [];
  for (let i = 0; i < todasLasEstaciones.length; i++) {
    const estacion = todasLasEstaciones[i];
    const nombre = estacion.nombre.toLowerCase();
    const plataforma = estacion.plataforma.toLowerCase();

    if (nombre.includes(texto) || plataforma.includes(texto)) {
      filtradas.push(estacion);
    }
  }

  mostrarEstaciones(filtradas);
});

cargarEstaciones();