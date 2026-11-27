/* Agenda logística: tarjetas, filtros y estados calculados por fecha.
   Datos: js/eventos-datos.js. Iconos: js/iconos.js. */
(function () {
  const raiz = document.getElementById('eventos');
  if (!raiz || typeof eventosLogistica === 'undefined') return;

  const $ = id => document.getElementById(id);
  const ico = (n, c) => (typeof icono === 'function' ? icono(n, c) : '');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const sinTildes = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const MESES_L = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
  const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  const DIAS_L = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  raiz.querySelectorAll('[data-icono]').forEach(el => { el.outerHTML = ico(el.dataset.icono, el.className); });

  function fechaHora(fecha, hora) {
    const [a, m, d] = fecha.split('-').map(Number);
    const [h, mi] = (hora || '00:00').split(':').map(Number);
    return new Date(a, m - 1, d, h, mi);
  }

  const eventos = eventosLogistica.map((e, i) => {
    const ini = fechaHora(e.fecha, e.inicio);
    const fin = e.fin ? fechaHora(e.fecha, e.fin) : fechaHora(e.fecha, '23:59');
    const area = (typeof AREAS_EVENTOS !== 'undefined' && AREAS_EVENTOS[e.area]) || { nombre: e.area, icono: 'layers' };
    return Object.assign({}, e, { id: i, t0: ini, t1: fin, areaInfo: area,
      texto: sinTildes([e.tipo, e.tema, e.lugar, area.nombre, e.responsable].join(' ')) });
  });

  function estado(e, ahora) {
    if (e.cancelado) return { clave: 'cancelada', texto: 'Cancelada', icono: 'ban' };
    if (ahora >= e.t1) return { clave: 'finalizada', texto: 'Finalizada', icono: 'circle-check' };
    if (ahora >= e.t0) return { clave: 'curso', texto: 'En curso', icono: 'circle-dot' };
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const dia = new Date(e.t0.getFullYear(), e.t0.getMonth(), e.t0.getDate());
    const dif = Math.round((dia - hoy) / 864e5);
    if (dif === 0) return { clave: 'hoy', texto: 'Hoy', icono: 'calendar-clock' };
    return { clave: 'proxima', texto: dif === 1 ? 'Mañana' : 'Próxima', icono: 'calendar-check', detalle: dif === 1 ? '' : 'En ' + dif + ' días' };
  }
  const esPasado = (e, ahora) => e.cancelado ? e.t1 <= ahora : ahora >= e.t1;

  // Opciones de área a partir de los datos (no se inventan áreas)
  const selArea = $('agArea');
  [...new Set(eventos.map(e => e.area))]
    .sort((a, b) => eventos.find(e => e.area === a).areaInfo.nombre.localeCompare(eventos.find(e => e.area === b).areaInfo.nombre, 'es'))
    .forEach(k => {
      const info = eventos.find(e => e.area === k).areaInfo;
      const o = document.createElement('option'); o.value = k; o.textContent = info.corto || info.nombre; selArea.appendChild(o);
    });

  const buscar = $('agBuscar'), btnLimpiar = $('agLimpiar'), badge = $('agActivos');
  const cuando = () => (raiz.querySelector('input[name="agCuando"]:checked') || {}).value || 'proximos';

  function tarjeta(e, ahora) {
    const st = estado(e, ahora);
    const d = e.t0;
    const fechaLarga = DIAS_L[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES_L[d.getMonth()] + ' de ' + d.getFullYear();
    const horario = e.inicio + (e.fin ? ' – ' + e.fin : '');
    return '<li class="ag-card is-' + st.clave + '">' +
      '<div class="ag-fecha" aria-hidden="true"><span class="ag-dow">' + DIAS[d.getDay()] + '</span><strong>' + String(d.getDate()).padStart(2, '0') + '</strong><span class="ag-mes">' + MESES[d.getMonth()] + '</span></div>' +
      '<div class="ag-cuerpo">' +
        '<div class="ag-top"><span class="ag-tipo">' + esc(e.tipo) + '</span>' +
          '<span class="ag-estado st-' + st.clave + '">' + ico(st.icono) + st.texto + '</span></div>' +
        '<h3 class="ag-nombre">' + esc(e.tema || e.tipo) + '</h3>' +
        '<p class="sr-only">' + fechaLarga + '</p>' +
        '<ul class="ag-datos">' +
          '<li title="Área o negocio">' + ico(e.areaInfo.icono) + '<span>' + esc(e.areaInfo.nombre) + '</span></li>' +
          '<li title="Horario">' + ico('clock-3') + '<span>' + horario + (st.detalle ? ' · <b>' + st.detalle + '</b>' : '') + '</span></li>' +
          (e.lugar ? '<li title="Ubicación">' + ico('map-pin') + '<span>' + esc(e.lugar) + '</span></li>' : '') +
          (e.responsable ? '<li title="Responsable">' + ico('user-round') + '<span>' + esc(e.responsable) + '</span></li>' : '') +
        '</ul>' +
      '</div></li>';
  }

  function grupo(titulo, lista, ahora) {
    return (titulo ? '<h3 class="ag-grupo">' + titulo + ' <span>' + lista.length + '</span></h3>' : '') +
      '<ul class="ag-grid" role="list">' + lista.map(e => tarjeta(e, ahora)).join('') + '</ul>';
  }

  function vacio(titulo, texto, accion, etiqueta) {
    return '<div class="ag-vacio" role="status">' + ico('calendar-x', 'ag-vacio-ico') +
      '<strong>' + titulo + '</strong><p>' + texto + '</p>' +
      (accion ? '<button type="button" class="ag-btn" data-accion="' + accion + '">' + etiqueta + '</button>' : '') + '</div>';
  }

  function render() {
    const ahora = new Date();
    const q = sinTildes(buscar.value.trim());
    const area = selArea.value;
    const modo = cuando();
    const filtrados = eventos.filter(e => (!area || e.area === area) && (!q || e.texto.includes(q)));
    const prox = filtrados.filter(e => !esPasado(e, ahora)).sort((a, b) => a.t0 - b.t0);
    const pas = filtrados.filter(e => esPasado(e, ahora)).sort((a, b) => b.t0 - a.t0);

    // Resumen del encabezado: próximos del total (sin filtros)
    const totalProx = eventos.filter(e => !esPasado(e, ahora) && !e.cancelado).length;
    $('agResumen').innerHTML = ico('calendar-clock') + '<span><b>' + totalProx + '</b> ' + (totalProx === 1 ? 'evento próximo' : 'eventos próximos') +
      ' · ' + eventos.length + ' registrados</span>';

    // Filtros activos
    const activos = (q ? 1 : 0) + (area ? 1 : 0) + (modo !== 'proximos' ? 1 : 0);
    btnLimpiar.disabled = activos === 0;
    badge.hidden = activos === 0; badge.textContent = activos;
    selArea.classList.toggle('is-activo', !!area);
    buscar.closest('.ag-input').classList.toggle('is-activo', !!q);

    const visibles = modo === 'proximos' ? prox.length : modo === 'pasados' ? pas.length : prox.length + pas.length;
    $('agConteo').textContent = 'Mostrando ' + visibles + ' de ' + eventos.length + ' eventos';

    let html = '';
    const hayFiltroTexto = q || area;
    if (modo === 'proximos') {
      if (prox.length) html = grupo('', prox, ahora);
      else if (hayFiltroTexto) html = vacio('No encontramos eventos con estos filtros.', 'Prueba con otra área o palabra clave.', 'limpiar', 'Limpiar filtros');
      else html = vacio('No hay eventos próximos registrados.', pas.length ? 'La última reunión fue el ' + DIAS_L[pas[0].t0.getDay()] + ' ' + pas[0].t0.getDate() + ' de ' + MESES_L[pas[0].t0.getMonth()] + '.' : '', pas.length ? 'pasados' : '', 'Ver eventos pasados (' + pas.length + ')');
    } else if (modo === 'pasados') {
      html = pas.length ? grupo('', pas, ahora) : vacio('No encontramos eventos con estos filtros.', hayFiltroTexto ? 'Prueba con otra área o palabra clave.' : 'Aún no hay eventos realizados.', hayFiltroTexto ? 'limpiar' : '', 'Limpiar filtros');
    } else {
      if (!prox.length && !pas.length) html = vacio('No encontramos eventos con estos filtros.', 'Prueba con otra área o palabra clave.', 'limpiar', 'Limpiar filtros');
      else html = (prox.length ? grupo('Próximos', prox, ahora) : '') + (pas.length ? grupo('Realizados', pas, ahora) : '');
    }
    $('agResultados').innerHTML = html;
  }

  function limpiar() {
    buscar.value = ''; selArea.value = '';
    raiz.querySelector('input[name="agCuando"][value="proximos"]').checked = true;
    render(); buscar.focus();
  }

  buscar.addEventListener('input', render);
  selArea.addEventListener('change', render);
  raiz.querySelectorAll('input[name="agCuando"]').forEach(r => r.addEventListener('change', render));
  btnLimpiar.addEventListener('click', limpiar);
  $('agResultados').addEventListener('click', ev => {
    const b = ev.target.closest('[data-accion]'); if (!b) return;
    if (b.dataset.accion === 'limpiar') limpiar();
    if (b.dataset.accion === 'pasados') { raiz.querySelector('input[name="agCuando"][value="pasados"]').checked = true; render(); }
  });
  buscar.addEventListener('keydown', ev => { if (ev.key === 'Escape' && buscar.value) { buscar.value = ''; render(); } });

  render();
  setInterval(render, 60000); // los estados (Hoy, En curso…) se actualizan solos
})();
