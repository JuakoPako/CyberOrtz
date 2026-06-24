

let estacionesCache = [];
let precioHoraSeleccionada = 0;

const tbody = document.getElementById('cuerpo-tabla');
const plantilla = document.getElementById('plantilla-fila');

const inputId = document.getElementById('estacion-id');
const inputNombre = document.getElementById('input-nombre');
const modalArriendoEl = document.getElementById('modal-arriendo');
const arriendoNombreEstacion = document.getElementById('arriendo-nombre-estacion');
const inputArriendoEstacionId = document.getElementById('arriendo-estacion-id');
const inputHoras = document.getElementById('input-horas');
const btnConfirmarArriendo = document.getElementById('btn-confirmar-arriendo');
const btnCancelarArriendo = document.getElementById('btn-cancelar-arriendo');
const tbodyArriendos = document.getElementById('cuerpo-tabla-arriendos');
const plantillaArriendo = document.getElementById('plantilla-fila-arriendo');
const inputTipo = document.getElementById('input-tipo');
const inputPlataforma = document.getElementById('input-plataforma');
const inputPrecio = document.getElementById('input-precio');
const inputDescripcion = document.getElementById('input-descripcion');
const inputDisponible = document.getElementById('input-disponible');
const textoSubtotal = document.getElementById('texto-subtotal');
const textoIva = document.getElementById('texto-iva');
const textoTotal = document.getElementById('texto-total');

const tituloForm = document.getElementById('titulo-formulario');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');

const cargarEstaciones = async () => {
  tbody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando...</td></tr>';

  try {
    const respuesta = await fetch('/api/estaciones');
    const estaciones = await respuesta.json();

    estacionesCache = estaciones;

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
  
  const btnArrendar = clon.querySelector('.btn-arrendar');
  if (estacion.disponible) {
    btnArrendar.addEventListener('click', () => {
      abrirFormularioArriendo(estacion);

    });
  } else {
    btnArrendar.classList.add('d-none');
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

const abrirFormularioArriendo = (estacion) => {
  inputArriendoEstacionId.value = estacion.id;
  arriendoNombreEstacion.textContent = estacion.nombre;
  inputHoras.value = '';
  precioHoraSeleccionada = estacion.precioHora;
  actualizarResumenPrecio();

  const modal = new bootstrap.Modal(modalArriendoEl);
  modal.show();
};

const confirmarArriendo = async () => {
  const estacionId = inputArriendoEstacionId.value;
  const horas = inputHoras.value;

  if (!estacionId || horas <= 0) {
    alert('Ingrese una cantidad de horas válida.');
    return;
  }

  if (horas > 12){
    alert('El maximo permitido son de 12 horas');
    return;
  }
  try {
    const respuesta = await fetch('/api/arriendos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estacionId: estacionId, horas: horas })
    });
    if (respuesta.ok) {
  const resultado = await respuesta.json();

  
  const estacion = estacionesCache.find(e => e.id == inputArriendoEstacionId.value);

  await generarBoucher({
    id: resultado.id,
    nombreEstacion: estacion ? estacion.nombre : 'Estación #' + inputArriendoEstacionId.value,
    horas: Number(inputHoras.value),
    precioHora: precioHoraSeleccionada,
    horaInicio: new Date().toISOString(),
    horaFin: new Date(Date.now() + Number(inputHoras.value) * 3600000).toISOString()
  });

  cancelarArriendo();
  cargarEstaciones();
  cargarArriendos();
} else {
        alert('No se pudo iniciar el arriendo');
    }
  } catch (err) {
    alert('Error al iniciar arriendo: ' + err.message);
  }
};

const cancelarArriendo = () => {
  const modal = bootstrap.Modal.getInstance(modalArriendoEl);
  if (modal) modal.hide();
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

const actualizarResumenPrecio = () => {
  const horas = Number(inputHoras.value) || 0;
  const subtotal = horas * precioHoraSeleccionada;
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  textoSubtotal.textContent = '$' + subtotal.toLocaleString('es-CL');
  textoIva.textContent = '$' + iva.toLocaleString('es-CL');
  textoTotal.textContent = '$' + total.toLocaleString('es-CL');
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

const cargarArriendos = async () => {
  tbodyArriendos.innerHTML = '<tr><td colspan="7" class="text-center">Cargando...</td></tr>';

  try {
    const respuesta = await fetch('/api/arriendos');
    const arriendos = await respuesta.json();

    tbodyArriendos.innerHTML = '';

    if (arriendos.length === 0) {
      tbodyArriendos.innerHTML = '<tr><td colspan="7" class="text-center">No hay arriendos activos</td></tr>';
    } else {
      for (let i = 0; i < arriendos.length; i++) {
        const fila = crearFilaArriendo(arriendos[i]);
        tbodyArriendos.appendChild(fila);
      }
    }
  } catch (err) {
    tbodyArriendos.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error: ${err.message}</td></tr>`;
  }
};

const buscarNombreEstacion = (estacionId) => {
  for (let i = 0; i < estacionesCache.length; i++) {
    if (estacionesCache[i].id === estacionId) {
      return estacionesCache[i].nombre;
    }
  }
  return 'Estación #' + estacionId;
};

const crearFilaArriendo = (arriendo) => {
  const clon = plantillaArriendo.content.cloneNode(true);

  clon.querySelector('.col-arr-id').textContent = arriendo.id;
  clon.querySelector('.col-arr-estacion').textContent = buscarNombreEstacion(arriendo.estacionId);
  clon.querySelector('.col-arr-horas').textContent = arriendo.horas;
  clon.querySelector('.col-arr-inicio').textContent = formatearFecha(arriendo.horaInicio);
  clon.querySelector('.col-arr-fin').textContent = formatearFecha(arriendo.horaFin);

  const celdaEstado = clon.querySelector('.col-arr-estado');
  if (arriendo.estado === 'activo') {
    celdaEstado.textContent = 'Activo';
  } else {
    celdaEstado.textContent = 'Finalizado';
  }

  const celdaAcciones = clon.querySelector('.col-arr-acciones');

  if (arriendo.estado === 'activo'){
    const btnFinalizar = document.createElement('button');
    btnFinalizar.textContent = 'Finalizar ahora';
    btnFinalizar.className = 'btn btn-warning btn-sm';
    btnFinalizar.addEventListener('click',() =>{
      finalizarArriendo(arriendo.id);
    });
    celdaAcciones.appendChild(btnFinalizar);
  }
  return clon;

};

const formatearFecha = (fechaTexto) => {
  const fecha = new Date(fechaTexto);
  return fecha.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const finalizarArriendo = async (id) => {
  if (!confirm('Seguro que deseas finalizar el arriendo ahora?')) return;

  try {
    const respuesta = await fetch(`/api/arriendos/${id}/finalizar`, {method: 'PUT'});

    if (respuesta.ok){
      cargarEstaciones();
      cargarArriendos();

    } else {
      alert('No se pudo finalizar el arriendo');
    }

  } catch (err) {
    alert('Error al finalizar: ' + err.message);
  }
};

const generarBoucher = async (datos) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });

  const subtotal = datos.horas * datos.precioHora;
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  const fmt = (n) => '$' + Math.round(n).toLocaleString('es-CL');
  const fechaInicio = new Date(datos.horaInicio).toLocaleString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const fechaFin = new Date(datos.horaFin).toLocaleString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

  
  try {
    const resp = await fetch('/img/CyberOrtz.png');
    const blob = await resp.blob();
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    doc.addImage(base64, 'PNG', 62, 4, 20, 22);  
  } catch (e) {
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('CyberOrtz', 74, 20, { align: 'center' });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Boleta de Arriendo', 74, 30, { align: 'center' }); 

  doc.setDrawColor(200);
  doc.line(15, 34, 133, 34);

  const filas = [
    ['N° Boleta', '#' + datos.id],
    ['Estacion', datos.nombreEstacion],
    ['Horas', datos.horas + ' horas'],
    ['Hora inicio', fechaInicio],
    ['Hora fin', fechaFin],
  ];

  let y = 42;
  doc.setFontSize(10);
  filas.forEach(([label, valor]) => {
    doc.setTextColor(120);
    doc.text(label, 15, y);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(valor, 133, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 8;
  });

  doc.line(15, y, 133, y);
  y += 8;

  const resumen = [
    ['Precio por hora', fmt(datos.precioHora)],
    ['Subtotal', fmt(subtotal)],
    ['IVA (19%)', fmt(iva)],
  ];

  resumen.forEach(([label, valor]) => {
    doc.setTextColor(120);
    doc.text(label, 15, y);
    doc.setTextColor(0);
    doc.text(valor, 133, y, { align: 'right' });
    y += 8;
  });

  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, y, 118, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Total', 20, y + 8);
  doc.text(fmt(total), 128, y + 8, { align: 'right' });

  y += 22;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text('Gracias por su preferencia — CyberOrtz 2026', 74, y, { align: 'center' });

  doc.save('boleta-arriendo-' + datos.id + '.pdf');
};

btnGuardar.addEventListener('click', guardar);
btnCancelar.addEventListener('click', limpiarFormulario);
btnConfirmarArriendo.addEventListener('click', confirmarArriendo);

inputHoras.addEventListener('input', actualizarResumenPrecio);

document.getElementById('btn-cancelar-arriendo-footer').addEventListener('click', cancelarArriendo);

cargarEstaciones();
cargarArriendos(); 