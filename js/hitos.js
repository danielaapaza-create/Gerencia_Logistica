/* Hitos del equipo: línea de tiempo por año con filtro por categoría.
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
  const PERSONA = { aniversario: true, bienvenida: true };

  raiz.querySelectorAll('[data-icono]').forEach(el => { el.outerHTML = ico(el.dataset.icono, el.className); });

  const clave = f => (f ? (f.length === 7 ? f + '-01' : f) : '');
  const hitos = hitosEquipo.map((h, i) => Object.assign({ id: i }, h))
    .sort((a, b) => clave(b.fecha).localeCompare(clave(a.fecha)));
  const cat = k => CATS[k] || { nombre: k, icono: 'flag' };

  function fechaTxt(f) {
    if (!f) return 'Fecha por confirmar';
    const [a, m, d] = f.split('-').map(Number);
    const t = (d ? d + ' de ' : '') + MESES_L[m - 1];
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function esFuturo(f) {
    if (!f) return false;
    const hoy = new Date(); const k = clave(f);
    const h = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');
    return f.length === 7 ? f > h.slice(0, 7) : k > h;
  }
  const iniciales = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();

  function chipsMeta(h) {
    const c = cat(h.categoria);
    return '<div class="hx-meta"><span class="hx-cat">' + ico(c.icono) + esc(c.nombre) + '</span>' +
      (esFuturo(h.fecha) ? '<span class="hx-prox">' + ico('calendar-clock') + 'Próximamente</span>' : '') +
      (h.confirmar ? '<span class="hx-conf" title="Fecha o texto pendiente de validar">' + ico('info') + 'Por confirmar</span>' : '') + '</div>';
  }

  function cardGeneral(h) {
    return '<article class="hx-card">' +
      (h.imagen ? '<div class="hx-foto"><img src="' + esc(h.imagen) + '" alt="" loading="lazy"></div>' : '') +
      '<div class="hx-txt">' + chipsMeta(h) +
        '<h4>' + esc(h.titulo) + '</h4>' +
        (h.descripcion ? '<p class="hx-desc">' + esc(h.descripcion) + '</p>' : '') +
        (h.impacto && h.impacto.valor ? '<p class="hx-impacto"><strong>' + esc(h.impacto.valor) + '</strong><span>' + esc(h.impacto.etiqueta) + '</span></p>' : '') +
        '<ul class="hx-pie"><li>' + ico('layers') + '<span>' + esc(h.area) + ' · ' + esc(EMPRESA[h.empresa] || h.empresa) + '</span></li>' +
        (h.equipo ? '<li>' + ico('users') + '<span>' + esc(h.equipo) + '</span></li>' : '') + '</ul>' +
      '</div></article>';
  }

  function cardPersona(h) {
    const aniv = h.categoria === 'aniversario';
    const empresa = EMPRESA[h.empresa] || h.empresa;
    const titulo = aniv ? esc(h.persona) + ' cumple ' + h.anios + (h.anios === 1 ? ' año' : ' años') + ' en ' + esc(empresa)
                        : 'Bienvenida a ' + esc(h.persona);
    return '<article class="hx-card hx-persona ' + (aniv ? 'is-aniv' : 'is-bienv') + '">' +
      '<div class="hx-avatar">' + (h.imagen ? '<img src="' + esc(h.imagen) + '" alt="">' : '<span>' + esc(iniciales(h.persona)) + '</span>') +
        (aniv ? '<b class="hx-anios"><strong>' + h.anios + '</strong>' + (h.anios === 1 ? 'año' : 'años') + '</b>' : '') + '</div>' +
      '<div class="hx-txt">' + chipsMeta(h) +
        '<h4>' + titulo + '</h4>' +
        '<p class="hx-cargo">' + esc(h.cargo || '') + (h.area ? ' · ' + esc(h.area) : '') + '</p>' +
        (h.mensaje ? '<p class="hx-desc">' + esc(h.mensaje) + '</p>' : '') +
      '</div></article>';
  }

  // Chips: solo categorías que tienen hitos
  let filtro = '';
  const chips = $('hxChips');
  function pintarChips() {
    const presentes = Object.keys(CATS).filter(k => hitos.some(h => h.categoria === k))
      .concat([...new Set(hitos.map(h => h.categoria))].filter(k => !CATS[k]));
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
    const rango = anios.length ? (Math.min(...anios) === Math.max(...anios) ? '' + anios[0] : Math.min(...anios) + '–' + Math.max(...anios)) : '';
    $('hxResumen').innerHTML = '<strong>' + hitos.length + '</strong><span>' + (hitos.length === 1 ? 'hito registrado' : 'hitos registrados') + (rango ? '<br>' + rango : '') + '</span>';

    const lista = hitos.filter(h => !filtro || h.categoria === filtro);
    if (!lista.length) {
      $('hxLista').innerHTML = '<div class="ag-vacio" role="status">' + ico('flag', 'ag-vacio-ico') + '<strong>Aún no hay hitos registrados.</strong></div>';
      return;
    }
    // Agrupar por año (los sin fecha, al final)
    const grupos = [];
    lista.forEach(h => {
      const g = h.fecha ? h.fecha.slice(0, 4) : 'Por confirmar';
      let gr = grupos.find(x => x.anio === g);
      if (!gr) grupos.push(gr = { anio: g, items: [] });
      gr.items.push(h);
    });
    let n = 0;
    $('hxLista').innerHTML = '<div class="hx-tl">' + grupos.map(g =>
      '<section class="hx-anio" aria-label="' + esc(g.anio) + '"><h4 class="hx-anio-tit"><span>' + esc(g.anio) + '</span></h4><ol class="hx-items">' +
      g.items.map(h => {
        const c = cat(h.categoria), lado = (n++ % 2) ? 'der' : 'izq';
        return '<li class="hx-item lado-' + lado + ' cat-' + esc(h.categoria) + '">' +
          '<span class="hx-dot" aria-hidden="true">' + ico(c.icono) + '</span>' +
          (h.fecha ? '<time class="hx-cuando" datetime="' + esc(h.fecha) + '">' + fechaTxt(h.fecha) + '</time>' : '<span class="hx-cuando"></span>') +
          (PERSONA[h.categoria] ? cardPersona(h) : cardGeneral(h)) + '</li>';
      }).join('') + '</ol></section>').join('') + '</div>';
  }
  render();
})();
