const tbody = document.getElementById('cuerpo-tabla');
const plantilla = document.getElementById('plantilla-fila');

const inputId = document.getElementById('estacion-id');
const inputNombre = document.getElementById('input-nombre');
const inputTipo = document.getElementById('input-tipo');
const inputPlataforma = document.getElementById('input-plataforma');
const inputPrecio = document.getElementById('input-precio');
const inputDescripcion = document.getElementById('input-descripcion');
const inputDisponible = document.getElementById('input-disponible');

const tituloForm = document.getElementById('titulo-formulario');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');

const cargarEstaciones = async () => {
  tbody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando...</td></tr>';

  try {
    const respuesta = await fetch('/api/estaciones');
    const estaciones = await respuesta.json();

    tbody.innerHTML = '';

    if (estaciones.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay estaciones registradas</td></tr>';
    } else {
      for (let i = 0; i < estaciones.length; i++) {
        const fila = crearFila(estaciones[i]);
        tbody.appendChild(fila);
      }
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error: ${err.message}</td></tr>`;
  }
};

const crearFila = (estacion) => {
  const clon = plantilla.content.cloneNode(true);

  clon.querySelector('.col-id').textContent = estacion.id;
  clon.querySelector('.col-nombre').textContent = estacion.nombre;
  clon.querySelector('.col-tipo').textContent = estacion.tipo;
  clon.querySelector('.col-plataforma').textContent = estacion.plataforma;
  clon.querySelector('.col-precio').textContent = '$' + Number(estacion.precioHora).toLocaleString('es-CL');

  const celdaEstado = clon.querySelector('.col-estado');
  if (estacion.disponible) {
    celdaEstado.textContent = 'Disponible';
  } else {
    celdaEstado.textContent = 'Ocupada';
  }

  clon.querySelector('.btn-editar').addEventListener('click', () => {
    prepararEdicion(estacion);
  });

  clon.querySelector('.btn-eliminar').addEventListener('click', () => {
    eliminarEstacion(estacion.id);
  });

  return clon;
};

const guardar = async () => {
  const id = inputId.value;
  const nombre = inputNombre.value.trim();
  const tipo = inputTipo.value;
  const plataforma = inputPlataforma.value.trim();
  const precioHora = inputPrecio.value;
  const descripcion = inputDescripcion.value.trim();
  const disponible = inputDisponible.checked;

  if (!nombre || !plataforma || !precioHora) {
    alert('Completa nombre, plataforma y precio.');
    return;
  }

  const datos = {
    nombre: nombre,
    tipo: tipo,
    plataforma: plataforma,
    precioHora: precioHora,
    disponible: disponible,
    descripcion: descripcion
  };

  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `/api/estaciones/${id}` : '/api/estaciones';

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (respuesta.ok) {
      limpiarFormulario();
      cargarEstaciones();
    } else {
      alert('No se pudo guardar la estación');
    }
  } catch (err) {
    alert('Error al guardar: ' + err.message);
  }
};

const prepararEdicion = (estacion) => {
  inputId.value = estacion.id;
  inputNombre.value = estacion.nombre;
  inputTipo.value = estacion.tipo;
  inputPlataforma.value = estacion.plataforma;
  inputPrecio.value = estacion.precioHora;
  inputDescripcion.value = estacion.descripcion;
  inputDisponible.checked = estacion.disponible ? true : false;

  tituloForm.textContent = 'Editar Estación';
};

const eliminarEstacion = async (id) => {
  if (!confirm('¿Seguro que deseas eliminar esta estación?')) return;

  try {
    const respuesta = await fetch(`/api/estaciones/${id}`, { method: 'DELETE' });

    if (respuesta.ok) {
      cargarEstaciones();
    } else {
      alert('No se pudo eliminar la estación');
    }
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
};

const limpiarFormulario = () => {
  inputId.value = '';
  inputNombre.value = '';
  inputTipo.value = 'PC';
  inputPlataforma.value = '';
  inputPrecio.value = '';
  inputDescripcion.value = '';
  inputDisponible.checked = true;

  tituloForm.textContent = 'Agregar Estación';
};

btnGuardar.addEventListener('click', guardar);
btnCancelar.addEventListener('click', limpiarFormulario);

cargarEstaciones();