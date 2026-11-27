/* Hitos del equipo: destacado, línea de tiempo y filtro por categoría.
   Datos: js/hitos-datos.js. Iconos: js/iconos.js. */
(function () {
  const raiz = document.getElementById('hitos');
  if (!raiz || typeof hitosEquipo === 'undefined') return;

  const $ = id => document.getElementById(id);
  const ico = (n, c) => (typeof icono === 'function' ? icono(n, c) : '');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const CATS = typeof CATEGORIAS_HITOS !== 'undefined' ? CATEGORIAS_HITOS : {};
  const MESES_L = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
  const EMPRESA = { 'SAN FERNANDO': 'San Fernando', 'CHIMU': 'Chimu', 'AMBAS': 'San Fernando · Chimu' };

  raiz.querySelectorAll('[data-icono]').forEach(el => { el.outerHTML = ico(el.dataset.icono, el.className); });

  // Orden: más reciente primero; los que no tienen fecha, al final.
  const clave = f => (f ? (f.length === 7 ? f + '-01' : f) : '');
  const hitos = hitosEquipo.map((h, i) => Object.assign({ id: i }, h))
    .sort((a, b) => clave(b.fecha).localeCompare(clave(a.fecha)));

  function fechaTxt(f) {
    if (!f) return 'Fecha por confirmar';
    const [a, m, d] = f.split('-').map(Number);
    return (d ? d + ' de ' : '') + MESES_L[m - 1] + ' ' + a;
  }
  const cat = k => CATS[k] || { nombre: k, icono: 'flag' };

  function meta(h) {
    const c = cat(h.categoria);
    return '<div class="hx-meta">' +
      '<span class="hx-cat">' + ico(c.icono) + esc(c.nombre) + '</span>' +
      '<span class="hx-fecha">' + ico('calendar') + fechaTxt(h.fecha) + '</span>' +
      (h.confirmar ? '<span class="hx-conf" title="Fecha o texto pendiente de validar">' + ico('info') + 'Por confirmar</span>' : '') +
      '</div>';
  }
  function pie(h) {
    return '<ul class="hx-pie">' +
      '<li>' + ico('layers') + '<span>' + esc(h.area) + ' · ' + esc(EMPRESA[h.empresa] || h.empresa) + '</span></li>' +
      (h.equipo ? '<li>' + ico('users') + '<span>' + esc(h.equipo) + '</span></li>' : '') +
      '</ul>';
  }
  function impacto(h) {
    return h.impacto && h.impacto.valor ? '<p class="hx-impacto"><strong>' + esc(h.impacto.valor) + '</strong><span>' + esc(h.impacto.etiqueta) + '</span></p>' : '';
  }
  function foto(h, clase) {
    return h.imagen
      ? '<div class="' + clase + '"><img src="' + esc(h.imagen) + '" alt="" loading="lazy"></div>'
      : '<div class="' + clase + ' hx-sinfoto" aria-hidden="true">' + ico(cat(h.categoria).icono) + '</div>';
  }

  function destacado(h) {
    return '<article class="hx-dest">' + foto(h, 'hx-dest-foto') +
      '<div class="hx-dest-txt"><span class="hx-etq">' + ico('star') + 'Destacado</span>' + meta(h) +
      '<h4>' + esc(h.titulo) + '</h4><p class="hx-desc">' + esc(h.descripcion) + '</p>' + impacto(h) + pie(h) + '</div></article>';
  }
  function tarjeta(h) {
    return '<li><article class="hx-card">' + foto(h, 'hx-card-foto') +
      '<div class="hx-card-txt">' + meta(h) + '<h4>' + esc(h.titulo) + '</h4><p class="hx-desc">' + esc(h.descripcion) + '</p>' +
      impacto(h) + pie(h) + '</div></article></li>';
  }

  // Chips: solo categorías que tienen hitos
  let filtro = '';
  const presentes = [...new Set(hitos.map(h => h.categoria))];
  const chips = $('hxChips');
  function pintarChips() {
    chips.innerHTML = [['', 'Todos', 'list-checks', hitos.length]]
      .concat(presentes.map(k => [k, cat(k).nombre, cat(k).icono, hitos.filter(h => h.categoria === k).length]))
      .map(([k, n, i, c]) => '<button type="button" class="hx-chip" data-cat="' + k + '" aria-pressed="' + (filtro === k) + '">' +
        ico(i) + '<span>' + esc(n) + '</span><b>' + c + '</b></button>').join('');
  }
  chips.addEventListener('click', ev => {
    const b = ev.target.closest('.hx-chip'); if (!b) return;
    filtro = b.dataset.cat; render();
    const nuevo = chips.querySelector('[data-cat="' + filtro + '"]'); if (nuevo) nuevo.focus();
  });

  function render() {
    pintarChips();
    const anios = hitos.filter(h => h.fecha).map(h => +h.fecha.slice(0, 4));
    const rango = anios.length ? (Math.min(...anios) === Math.max(...anios) ? Math.min(...anios) : Math.min(...anios) + '–' + Math.max(...anios)) : '';
    $('hxResumen').innerHTML = '<strong>' + hitos.length + '</strong><span>' + (hitos.length === 1 ? 'hito registrado' : 'hitos registrados') + (rango ? '<br>' + rango : '') + '</span>';

    const lista = hitos.filter(h => !filtro || h.categoria === filtro);
    if (!lista.length) {
      $('hxLista').innerHTML = '<div class="ag-vacio" role="status">' + ico('flag', 'ag-vacio-ico') + '<strong>Aún no hay hitos registrados.</strong></div>';
      return;
    }
    const dest = lista.find(h => h.destacado) || null;
    const resto = lista.filter(h => h !== dest);
    $('hxLista').innerHTML = (dest ? destacado(dest) : '') +
      (resto.length ? '<ul class="hx-grid" role="list">' + resto.map(tarjeta).join('') + '</ul>' : '');
  }
  render();
})();
