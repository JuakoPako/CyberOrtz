const kpiTotalEstaciones = document.getElementById('kpi-total-estaciones');
const kpiDisponibles = document.getElementById('kpi-disponibles');
const kpiOcupadas = document.getElementById('kpi-ocupadas');
const kpiArriendosMes = document.getElementById('kpi-arriendos-mes');

const mesSubtotal = document.getElementById('mes-subtotal');
const mesIva = document.getElementById('mes-iva');
const mesTotal = document.getElementById('mes-total');

const totalSubtotal = document.getElementById('total-subtotal');
const totalIva = document.getElementById('total-iva');
const totalTotal = document.getElementById('total-total');

const tbodyRanking = document.getElementById('cuerpo-tabla-ranking');
const plantillaRanking = document.getElementById('plantilla-fila-ranking');

const formatearMoneda = (numero) => {
  return '$' + Math.round(Number(numero)).toLocaleString('es-CL');
};

const crearFilaRanking = (estacion) => {
  const clon = plantillaRanking.content.cloneNode(true);

  clon.querySelector('.col-rk-nombre').textContent = estacion.nombre;
  clon.querySelector('.col-rk-tipo').textContent = estacion.tipo;
  clon.querySelector('.col-rk-plataforma').textContent = estacion.plataforma;

  const celdaEstado = clon.querySelector('.col-rk-estado');
  if (estacion.disponible) {
    celdaEstado.textContent = 'Disponible';
    celdaEstado.classList.add('text-success');
  } else {
    celdaEstado.textContent = 'Ocupada';
    celdaEstado.classList.add('text-danger');
  }

  clon.querySelector('.col-rk-arriendos').textContent = estacion.totalArriendos;
  clon.querySelector('.col-rk-horas').textContent = estacion.horasArrendadas;
  clon.querySelector('.col-rk-subtotal').textContent = formatearMoneda(estacion.subtotalGenerado);
  clon.querySelector('.col-rk-iva').textContent = formatearMoneda(estacion.ivaGenerado);
  clon.querySelector('.col-rk-total').textContent = formatearMoneda(estacion.totalGenerado);

  return clon;
};

const cargarDashboard = async () => {
  tbodyRanking.innerHTML = '<tr><td colspan="9" class="text-center">Cargando...</td></tr>';

  try {
    const respuesta = await fetch('/api/dashboard');
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      tbodyRanking.innerHTML = `<tr><td colspan="9" class="text-danger text-center">${datos.error}</td></tr>`;
      return;
    }


    kpiTotalEstaciones.textContent = datos.estaciones.total;
    kpiDisponibles.textContent = datos.estaciones.disponibles;
    kpiOcupadas.textContent = datos.estaciones.ocupadas;
    kpiArriendosMes.textContent = datos.recaudacionMes.cantidadArriendos;


    mesSubtotal.textContent = formatearMoneda(datos.recaudacionMes.subtotal);
    mesIva.textContent = formatearMoneda(datos.recaudacionMes.iva);
    mesTotal.textContent = formatearMoneda(datos.recaudacionMes.total);


    totalSubtotal.textContent = formatearMoneda(datos.recaudacionTotal.subtotal);
    totalIva.textContent = formatearMoneda(datos.recaudacionTotal.iva);
    totalTotal.textContent = formatearMoneda(datos.recaudacionTotal.total);


    tbodyRanking.innerHTML = '';

    if (datos.ranking.length === 0) {
      tbodyRanking.innerHTML = '<tr><td colspan="9" class="text-center">No hay estaciones registradas</td></tr>';
    } else {
      for (let i = 0; i < datos.ranking.length; i++) {
        const fila = crearFilaRanking(datos.ranking[i]);
        tbodyRanking.appendChild(fila);
      }
    }
  } catch (err) {
    tbodyRanking.innerHTML = `<tr><td colspan="9" class="text-danger text-center">Error: ${err.message}</td></tr>`;
  }
};

cargarDashboard();
