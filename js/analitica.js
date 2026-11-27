/* Analítica logística: KPI, gráfico de dashboards por área y catálogo filtrable.
   Datos: analyticsData (js/datos.js). Iconos: js/iconos.js.
   Los filtros conservan los id originales (aSearch, aCompany, aArea), que usa
   también la ficha de negocios para abrir la analítica de un área. */
(function () {
  const sec = document.getElementById('analitica');
  if (!sec || typeof analyticsData === 'undefined') return;

  const $ = id => document.getElementById(id);
  const ico = (n, c) => (typeof icono === 'function' ? icono(n, c) : '');
  const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const sinTildes = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

  sec.querySelectorAll('[data-icono]').forEach(el => { el.outerHTML = ico(el.dataset.icono, el.className); });

  // Etiquetas legibles (los valores originales se mantienen en los filtros)
  const AREA = { 'AVES VIVAS': 'Aves vivas', 'ALIMENTO BALANCEADO': 'Alimento balanceado', 'POLLO BB & HI': 'Pollo BB & HI',
    'MACRO INSUMOS': 'Macroinsumos', 'ALMACEN CENTRAL': 'Almacén central' };
  const EMP = { 'SAN FERNANDO': { nombre: 'San Fernando', corto: 'SF', lema: 'La buena familia', cls: 'sf' },
    'CHIMU': { nombre: 'Chimu', corto: 'CH', lema: 'Así nos gusta el pollo', cls: 'ch' } };
  const nombreArea = a => AREA[a] || (a.charAt(0) + a.slice(1).toLowerCase());
  const emp = e => EMP[e] || { nombre: e, corto: e.slice(0, 2), lema: '', cls: 'otro' };
  const persona = s => String(s || '').toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase());
  const tituloDash = s => String(s || '').replace(/^\s*pbi\s*-\s*/i, '').trim();
  const fecha = (f, hr) => {
    if (!f) return '—';
    const [a, m, d] = f.split('-').map(Number);
    return d + ' ' + MESES[m - 1] + ' ' + a + (hr ? ' · ' + hr.slice(0, 5) : '');
  };
  const ordenEmp = e => (e === 'SAN FERNANDO' ? 0 : e === 'CHIMU' ? 1 : 2);
  const porNombre = (a, b) => nombreArea(a).localeCompare(nombreArea(b), 'es');

  const datos = analyticsData.map((x, i) => Object.assign({ id: i, texto: sinTildes([x.dashboard, x.area, nombreArea(x.area), x.responsable, x.jefatura, x.gerencia, x.empresa].join(' ')) }, x));
  const empresas = [...new Set(datos.map(x => x.empresa))].sort((a, b) => ordenEmp(a) - ordenEmp(b) || a.localeCompare(b));
  const areas = [...new Set(datos.map(x => x.area))].sort(porNombre);

  const selEmp = $('aCompany'), selArea = $('aArea'), buscar = $('aSearch'), btnLimpiar = $('axLimpiar');
  empresas.forEach(e => selEmp.insertAdjacentHTML('beforeend', '<option value="' + h(e) + '">' + h(emp(e).nombre) + '</option>'));
  areas.forEach(a => selArea.insertAdjacentHTML('beforeend', '<option value="' + h(a) + '">' + h(nombreArea(a)) + '</option>'));

  // Última actualización registrada (dato del catálogo)
  const ultima = datos.filter(x => x.fecha).sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora))[0];
  if (ultima) $('axActualizado').textContent = 'Última actualización registrada: ' + fecha(ultima.fecha) + '. Abre cada dashboard directamente en Power BI.';

  // KPI (los mismos cuatro del diseño original, calculados desde los datos)
  const cuenta = e => datos.filter(x => x.empresa === e).length;
  const kpis = [
    { ico: 'chart-column', label: 'Dashboards', valor: datos.length, nota: 'en el catálogo', cls: 'total' },
    ...empresas.map(e => ({ ico: 'layers', label: emp(e).nombre, valor: cuenta(e), nota: 'dashboards', cls: emp(e).cls })),
    { ico: 'workflow', label: 'Áreas', valor: areas.length, nota: 'con analítica', cls: 'areas' }
  ];
  $('axKpis').innerHTML = kpis.map(k => '<div class="ax-kpi ' + k.cls + '"><span class="ax-kpi-ico">' + ico(k.ico) + '</span>' +
    '<div><small>' + h(k.label) + '</small><strong>' + k.valor + '</strong><span>' + h(k.nota) + '</span></div></div>').join('');

  // Gráfico: dashboards por área (barras apiladas por empresa)
  const filasGraf = areas.map(a => ({ a, partes: empresas.map(e => ({ e, n: datos.filter(x => x.area === a && x.empresa === e).length })) }))
    .map(f => Object.assign(f, { total: f.partes.reduce((s, p) => s + p.n, 0) }))
    .sort((x, y) => y.total - x.total || porNombre(x.a, y.a));
  const maximo = Math.max(...filasGraf.map(f => f.total), 1);
  function pintarBarras() {
    $('axBarras').innerHTML = filasGraf.map(f => {
      const detalle = f.partes.filter(p => p.n).map(p => p.n + ' ' + emp(p.e).nombre).join(', ');
      return '<button type="button" class="ax-barra' + (selArea.value === f.a ? ' is-activa' : '') + '" data-area="' + h(f.a) + '" ' +
        'aria-pressed="' + (selArea.value === f.a) + '" aria-label="' + h(nombreArea(f.a)) + ': ' + f.total + ' dashboards (' + h(detalle) + ')">' +
        '<span class="ax-barra-lbl">' + h(nombreArea(f.a)) + '</span>' +
        '<span class="ax-barra-pista"><span class="ax-barra-fill" style="width:' + (f.total / maximo * 100).toFixed(1) + '%">' +
          f.partes.filter(p => p.n).map(p => '<i class="' + emp(p.e).cls + '" style="flex:' + p.n + '" title="' + h(emp(p.e).nombre) + ': ' + p.n + '"></i>').join('') +
        '</span></span>' +
        '<span class="ax-barra-val">' + f.total + '</span></button>';
    }).join('');
  }
  $('axBarras').addEventListener('click', ev => {
    const b = ev.target.closest('.ax-barra'); if (!b) return;
    selArea.value = selArea.value === b.dataset.area ? 'TODAS' : b.dataset.area;
    render();
    sec.querySelector('.ax-detalle').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  // Catálogo
  const abiertas = new Set();
  function render() {
    const q = sinTildes(buscar.value.trim()), co = selEmp.value, ar = selArea.value;
    const filas = datos.filter(x => (!q || x.texto.includes(q)) && (co === 'TODAS' || x.empresa === co) && (ar === 'TODAS' || x.area === ar));
    const activos = (q ? 1 : 0) + (co !== 'TODAS' ? 1 : 0) + (ar !== 'TODAS' ? 1 : 0);
    btnLimpiar.disabled = !activos;
    selEmp.classList.toggle('is-activo', co !== 'TODAS'); selArea.classList.toggle('is-activo', ar !== 'TODAS');
    buscar.closest('.ax-input').classList.toggle('is-activo', !!q);
    $('axConteo').textContent = 'Mostrando ' + filas.length + ' de ' + datos.length + ' dashboards';
    pintarBarras();

    const abrirTodo = !!q || ar !== 'TODAS';
    const grupos = empresas.filter(e => filas.some(x => x.empresa === e));
    $('companyGrid').innerHTML = grupos.length ? grupos.map(e => {
      const E = emp(e), deEmp = filas.filter(x => x.empresa === e);
      const ars = [...new Set(deEmp.map(x => x.area))].sort(porNombre);
      return '<article class="company-card ax-emp ' + E.cls + (e === 'CHIMU' ? ' chimu' : '') + '">' +
        '<header class="ax-emp-head"><span class="ax-emp-logo">' + h(E.corto) + '</span>' +
          '<div><h4>' + h(E.nombre) + '</h4>' + (E.lema ? '<span>' + h(E.lema) + '</span>' : '') + '</div>' +
          '<span class="ax-emp-n">' + deEmp.length + ' dashboard' + (deEmp.length === 1 ? '' : 's') + '</span></header>' +
        ars.map(a => {
          const lista = deEmp.filter(x => x.area === a), key = e + '|' + a, open = abrirTodo || abiertas.has(key);
          const idp = 'axp-' + sinTildes(key).replace(/[^a-z0-9]+/g, '-');
          return '<div class="area-row ax-area' + (open ? ' open' : '') + '" data-key="' + h(key) + '">' +
            '<button type="button" class="ax-area-btn" aria-expanded="' + open + '" aria-controls="' + idp + '">' +
              '<span class="ax-area-nom">' + h(nombreArea(a)) + '</span>' +
              '<span class="ax-area-n">' + lista.length + '</span>' + ico('chevron-right', 'ax-chev') + '</button>' +
            '<ul class="ax-dash-list" id="' + idp + '"' + (open ? '' : ' hidden') + '>' + lista.map(x => {
              const url = /^https?:\/\//i.test(x.url);
              return '<li class="ax-dash"><div class="ax-dash-txt"><h5>' + h(tituloDash(x.dashboard)) + '</h5>' +
                '<p><span>' + ico('user-round') + 'Responsable: <b>' + h(persona(x.responsable) || '—') + '</b></span>' +
                '<span>Jefatura: <b>' + h(persona(x.jefatura) || '—') + '</b></span>' +
                '<span>' + ico('clock-3') + 'Actualizado: ' + fecha(x.fecha, x.hora) + '</span></p></div>' +
                (url ? '<a class="ax-abrir" href="' + h(x.url) + '" target="_blank" rel="noopener noreferrer" aria-label="Abrir ' + h(tituloDash(x.dashboard)) + ' en Power BI (nueva pestaña)">Abrir en Power BI' + ico('arrow-up-right') + '</a>'
                     : '<span class="ax-sin-enlace">Enlace pendiente</span>') + '</li>';
            }).join('') + '</ul></div>';
        }).join('') + '</article>';
    }).join('') : '<div class="ax-vacio" role="status">' + ico('search', 'ax-vacio-ico') + '<strong>No hay dashboards con estos filtros.</strong>' +
      '<button type="button" class="ax-limpiar" data-limpiar>' + ico('rotate-ccw') + 'Limpiar filtros</button></div>';
  }

  $('companyGrid').addEventListener('click', ev => {
    if (ev.target.closest('[data-limpiar]')) { limpiar(); return; }
    const b = ev.target.closest('.ax-area-btn'); if (!b) return;
    const row = b.closest('.ax-area'), open = !row.classList.contains('open');
    row.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
    row.querySelector('.ax-dash-list').hidden = !open;
    open ? abiertas.add(row.dataset.key) : abiertas.delete(row.dataset.key);
  });
  function limpiar() { buscar.value = ''; selEmp.value = 'TODAS'; selArea.value = 'TODAS'; render(); buscar.focus(); }
  btnLimpiar.addEventListener('click', limpiar);
  buscar.addEventListener('input', render);
  selEmp.addEventListener('change', render);
  selArea.addEventListener('change', render);

  // La ficha de negocios marca la primera área como abierta con la clase "open"
  new MutationObserver(() => {
    sec.querySelectorAll('.ax-area.open').forEach(r => {
      const b = r.querySelector('.ax-area-btn'), l = r.querySelector('.ax-dash-list');
      if (l && l.hidden) { l.hidden = false; b.setAttribute('aria-expanded', 'true'); abiertas.add(r.dataset.key); }
    });
  }).observe($('companyGrid'), { subtree: true, attributes: true, attributeFilter: ['class'] });

  render();
})();
