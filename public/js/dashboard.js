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
const btnExportarPDF = document.getElementById('btn-exportar-pdf');
const btnExportarExcel = document.getElementById('btn-exportar-excel');

let ultimosDatos = null;

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

    ultimosDatos = datos;

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

const exportarPDF = async () => {
  if (!ultimosDatos) {
    alert('Primero debes esperar a que carguen los datos del dashboard');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const fmt = formatearMoneda;
  const fecha = new Date().toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });


  try {
    const resp = await fetch('/img/CyberOrtz.png');
    const blob = await resp.blob();
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    doc.addImage(base64, 'PNG', 90, 8, 20, 22);
  } catch (e) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('CyberOrtz', 105, 20, { align: 'center' });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Reporte de Gestión General', 105, 36, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('Generado el ' + fecha, 105, 42, { align: 'center' });
  doc.setTextColor(0);

  doc.setDrawColor(200);
  doc.line(15, 47, 195, 47);


  let y = 56;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Estaciones', 15, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const filasEstaciones = [
    ['Total de estaciones', String(ultimosDatos.estaciones.total)],
    ['Disponibles', String(ultimosDatos.estaciones.disponibles)],
    ['Ocupadas', String(ultimosDatos.estaciones.ocupadas)],
  ];
  filasEstaciones.forEach(([label, valor]) => {
    doc.setTextColor(120);
    doc.text(label, 15, y);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(valor, 195, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 6;
  });

  y += 4;
  doc.line(15, y, 195, y);
  y += 9;


  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Recaudado este mes', 15, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const filasMes = [
    ['Arriendos finalizados', String(ultimosDatos.recaudacionMes.cantidadArriendos)],
    ['Subtotal', fmt(ultimosDatos.recaudacionMes.subtotal)],
    ['IVA (19%)', fmt(ultimosDatos.recaudacionMes.iva)],
  ];
  filasMes.forEach(([label, valor]) => {
    doc.setTextColor(120);
    doc.text(label, 15, y);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(valor, 195, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 6;
  });

  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, y, 180, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total del mes', 20, y + 7);
  doc.text(fmt(ultimosDatos.recaudacionMes.total), 190, y + 7, { align: 'right' });
  y += 18;


  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Recaudado histórico (total)', 15, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const filasTotal = [
    ['Arriendos finalizados', String(ultimosDatos.recaudacionTotal.cantidadArriendos)],
    ['Subtotal', fmt(ultimosDatos.recaudacionTotal.subtotal)],
    ['IVA (19%)', fmt(ultimosDatos.recaudacionTotal.iva)],
  ];
  filasTotal.forEach(([label, valor]) => {
    doc.setTextColor(120);
    doc.text(label, 15, y);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(valor, 195, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 6;
  });

  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, y, 180, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Total histórico', 20, y + 7);
  doc.text(fmt(ultimosDatos.recaudacionTotal.total), 190, y + 7, { align: 'right' });
  y += 20;


  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Ganancias por estación', 15, y);
  y += 4;

  const filasTabla = ultimosDatos.ranking.map((estacion) => [
    estacion.nombre,
    estacion.tipo,
    estacion.plataforma,
    estacion.disponible ? 'Disponible' : 'Ocupada',
    String(estacion.totalArriendos),
    String(estacion.horasArrendadas),
    fmt(estacion.subtotalGenerado),
    fmt(estacion.totalGenerado)
  ]);

  doc.autoTable({
    startY: y + 3,
    head: [['Estación', 'Tipo', 'Plataforma', 'Estado', 'Arriendos', 'Horas', 'Subtotal', 'Total']],
    body: filasTabla,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [60, 60, 60] },
    margin: { left: 15, right: 15 }
  });

  doc.save('reporte-cyberortz-' + new Date().toISOString().slice(0, 10) + '.pdf');
};

btnExportarPDF.addEventListener('click', exportarPDF);

const exportarExcel = () => {
  if (!ultimosDatos) {
    alert('Primero debes esperar a que carguen los datos del dashboard');
    return;
  }

  const filasResumen = [
    ['Reporte de Gestión General — CyberOrtz'],
    ['Generado el', new Date().toLocaleString('es-CL')],
    [],
    ['Estaciones'],
    ['Total de estaciones', ultimosDatos.estaciones.total],
    ['Disponibles', ultimosDatos.estaciones.disponibles],
    ['Ocupadas', ultimosDatos.estaciones.ocupadas],
    [],
    ['Recaudado este mes'],
    ['Arriendos finalizados', ultimosDatos.recaudacionMes.cantidadArriendos],
    ['Subtotal', ultimosDatos.recaudacionMes.subtotal],
    ['IVA (19%)', ultimosDatos.recaudacionMes.iva],
    ['Total', ultimosDatos.recaudacionMes.total],
    [],
    ['Recaudado histórico (total)'],
    ['Arriendos finalizados', ultimosDatos.recaudacionTotal.cantidadArriendos],
    ['Subtotal', ultimosDatos.recaudacionTotal.subtotal],
    ['IVA (19%)', ultimosDatos.recaudacionTotal.iva],
    ['Total', ultimosDatos.recaudacionTotal.total],
  ];

  const hojaResumen = XLSX.utils.aoa_to_sheet(filasResumen);
  hojaResumen['!cols'] = [{ wch: 28 }, { wch: 20 }];


  const filasRanking = ultimosDatos.ranking.map((estacion) => ({
    'Estación': estacion.nombre,
    'Tipo': estacion.tipo,
    'Plataforma': estacion.plataforma,
    'Estado actual': estacion.disponible ? 'Disponible' : 'Ocupada',
    'Arriendos finalizados': estacion.totalArriendos,
    'Horas arrendadas': estacion.horasArrendadas,
    'Subtotal': estacion.subtotalGenerado,
    'IVA (19%)': estacion.ivaGenerado,
    'Total generado': estacion.totalGenerado
  }));

  const hojaRanking = XLSX.utils.json_to_sheet(filasRanking);
  hojaRanking['!cols'] = [
    { wch: 24 }, { wch: 12 }, { wch: 18 }, { wch: 14 },
    { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 }
  ];


  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen');
  XLSX.utils.book_append_sheet(libro, hojaRanking, 'Ranking por estacion');

  XLSX.writeFile(libro, 'reporte-cyberortz-' + new Date().toISOString().slice(0, 10) + '.xlsx');
};

btnExportarExcel.addEventListener('click', exportarExcel);

cargarDashboard();
