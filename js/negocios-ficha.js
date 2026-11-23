/* ============================================================================
   LOGIXSC+ · Ficha ejecutiva de indicadores por negocio
   ----------------------------------------------------------------------------
   Se abre al hacer clic en una tarjeta de "Nuestros negocios".
   Estructura narrativa (cada capítulo responde una pregunta):
     Lectura rápida → ¿Cómo funciona? → 01 Volumen → 02 Recursos →
     03 Entregas → 04 Canales → 05 Resultados → Puntos de atención
   Datos: js/negocios-datos.js · Iconos: js/iconos.js (Lucide)
   ========================================================================== */
(function () {
  const DATA = typeof negociosIndicadores !== 'undefined' ? negociosIndicadores : null;
  const cards = [...document.querySelectorAll('#negocios .business')];
  if (!DATA || !cards.length) return;
  const ic = (n, c) => (typeof icono === 'function' ? icono(n, c) : '');

  /* ---------------- utilidades de formato ---------------- */
  const e = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  const nf = (n, d = 0) => Number(n).toLocaleString('es-PE', { maximumFractionDigits: d });
  const pct = (n, d = 1) => nf(n, d) + '%';
  /* Divide un número en cifra + escala: 7 850 000 → {num:'7.85', esc:'millones'} */
  function partes(n) {
    const a = Math.abs(n);
    if (a >= 1e6) return { num: nf(n / 1e6, 2), esc: 'millones' };
    if (a >= 1e4) return { num: nf(n / 1e3, 1), esc: 'mil' };
    return { num: nf(n), esc: '' };
  }
  const corto = n => { const p = partes(n); return p.num + (p.esc === 'millones' ? ' M' : p.esc ? ' mil' : ''); };
  const soles = n => 'S/ ' + corto(n);
  const UNIDADES = { t: 'toneladas', km: 'kilómetros', '%': '%' };
  const unidadLarga = u => UNIDADES[u] || u || '';
  /* "7.85 millones de aves" · "612.4 mil kilómetros" · "3,420 viajes" */
  function conUnidad(n, u) {
    const p = partes(n), ul = unidadLarga(u);
    if (p.esc === 'millones') return { num: p.num, txt: `millones de ${ul}` };
    if (p.esc === 'mil') return { num: p.num, txt: `mil ${ul}` };
    return { num: p.num, txt: ul };
  }
  const MES_LARGO = { Ene: 'enero', Feb: 'febrero', Mar: 'marzo', Abr: 'abril', May: 'mayo', Jun: 'junio', Jul: 'julio', Ago: 'agosto', Set: 'setiembre', Sep: 'setiembre', Oct: 'octubre', Nov: 'noviembre', Dic: 'diciembre' };
  const mesLargo = m => MES_LARGO[m] || m;

  /* ---------------- diccionario: iconos, nombres y definiciones ---------------- */
  const ICONO_UNIDAD = { aves: 'bird', pollitos: 'bird', pavos: 'bird', huevos: 'egg', cerdos: 'paw-print', sacos: 'package', contenedores: 'container', 'ítems': 'boxes' };
  const MOVILIZADOS = { aves: 'Aves movilizadas' };
  function kpiInfo(k) {
    const l = k.label.toLowerCase();
    if (l.startsWith('unidades')) return {
      icono: ICONO_UNIDAD[k.unidad] || 'boxes',
      nombre: MOVILIZADOS[k.unidad] || (k.unidad.charAt(0).toUpperCase() + k.unidad.slice(1) + ' movilizados'),
      def: `Cantidad total de ${k.unidad} transportadas durante el periodo seleccionado.`, sentido: 'neutral' };
    if (l.startsWith('viajes')) return { icono: 'truck', nombre: 'Viajes realizados', def: 'Número de viajes realizados por la flota durante el periodo seleccionado.', sentido: 'neutral' };
    if (l.startsWith('km')) return { icono: 'route', nombre: 'Kilómetros recorridos', def: 'Distancia total recorrida por la flota durante el periodo seleccionado.', sentido: 'neutral' };
    if (l.startsWith('tonelada')) return { icono: 'weight', nombre: 'Toneladas transportadas', def: 'Peso total transportado durante el periodo. No equivale a toneladas vendidas.', sentido: 'neutral' };
    return { icono: 'chart-column', nombre: k.label, def: k.label, sentido: 'neutral' };
  }
  const GLOSARIO = {
    'Distribución': ['truck', 'La empresa entrega el producto al cliente con su flota.'],
    'Recoge (cliente)': ['store', 'El cliente retira el producto con su propio transporte.'],
    'Granja propia': ['tractor', 'Producción enviada a granjas de la empresa.'],
    'Venta': ['shopping-cart', 'Producción destinada a venta a terceros.'],
    'Granel (tolvas)': ['container', 'Alimento transportado suelto en unidades tolva, sin sacos.'],
    'Ensacado': ['package', 'Alimento despachado en sacos.'],
    'Almacén propio': ['warehouse', 'Almacén operado por la empresa.'],
    'Almacén tercero': ['handshake', 'Almacén operado por un proveedor externo.']
  };
  const TERM = {
    propias: 'Unidades de la flota de la empresa.',
    terceros: 'Unidades de transportistas contratados.',
    gps: 'Monitoreo satelital de la flota en tiempo real (GPS + Segurtrack).',
    promedio: 'Promedio de los meses registrados para este indicador.'
  };
  const term = (txt, def) => `<span class="ni-term" tabindex="0" data-tip="${e(def)}">${txt}</span>`;

  /* Flujo conceptual (adaptable con "flujo" en los datos del negocio) */
  const FLUJO_BASE = [
    { id: 'origen', icono: 'map-pin', nombre: 'Origen', desc: 'Donde inicia el movimiento: granjas, plantas, puertos o centros de abastecimiento.' },
    { id: 'carga', icono: 'package-open', nombre: 'Carga', desc: 'El producto se prepara y se carga en las unidades.' },
    { id: 'transporte', icono: 'truck', nombre: 'Transporte', desc: 'Traslado con flota propia y de terceros, monitoreada por GPS.' },
    { id: 'entrega', icono: 'package-check', nombre: 'Entrega', desc: 'El producto llega al cliente por distribución o recojo.' },
    { id: 'destino', icono: 'flag', nombre: 'Destino', desc: 'Clientes, granjas o almacenes que reciben el producto.' }
  ];

  const empresas = Object.keys(DATA.empresas);
  let empresaActual = empresas[0], negocioActual = null, ultimoFoco = null;

  /* ---------------- modal ---------------- */
  const modal = document.createElement('div');
  modal.className = 'ni-modal';
  modal.id = 'negocioModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'niTitulo');
  modal.innerHTML = '<div class="ni-box"></div><div class="ni-tip" role="tooltip"><b></b><span></span></div>';
  document.body.appendChild(modal);
  const box = modal.querySelector('.ni-box');
  const tip = modal.querySelector('.ni-tip');

  /* ---------------- tarjetas ---------------- */
  cards.forEach(card => {
    const nombre = card.querySelector('h3')?.textContent.trim();
    if (!nombre) return;
    card.classList.add('ni-clickable');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Ver indicadores de ' + nombre);
    const cta = document.createElement('span');
    cta.className = 'ni-cta';
    cta.innerHTML = 'VER INDICADORES <b>→</b>';
    card.appendChild(cta);
    card.addEventListener('click', () => abrir(card, nombre));
    card.addEventListener('keydown', ev => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(card, nombre); }
    });
  });

  function abrir(card, nombre) {
    ultimoFoco = card;
    negocioActual = { card, nombre };
    render();
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    box.querySelector('.ni-close')?.focus();
  }
  function cerrar() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    ocultarTip();
    ultimoFoco?.focus();
  }
  modal.addEventListener('click', ev => { if (ev.target === modal) cerrar(); });
  window.addEventListener('keydown', ev => {
    if (!modal.classList.contains('show')) return;
    if (ev.key === 'Escape') cerrar();
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') ev.stopPropagation(); // no mover el carrusel del inicio
  }, true);

  /* ================================================================
     RENDER
     ================================================================ */
  function render() {
    const { card, nombre } = negocioActual;
    const img = card.querySelector('img')?.getAttribute('src') || '';
    const tag = card.querySelector('.business-tag')?.textContent.trim() || '';
    const desc = card.querySelector('p')?.textContent.trim() || '';
    const d = (DATA.empresas[empresaActual] || {})[nombre];
    const idx = cards.indexOf(card);
    const caps = d ? capitulos(d) : [];
    const ejemplo = DATA.ejemplo && d;

    box.innerHTML = `
      <header class="ni-head" style="background-image:linear-gradient(90deg,rgba(3,25,55,.96) 0%,rgba(3,25,55,.88) 45%,rgba(3,25,55,.55) 100%),url('${e(img)}')">
        <div class="ni-head-bar">
          <span class="ni-crumb">NUESTROS NEGOCIOS <i>/</i> ${e(nombre.toUpperCase())}</span>
          <div class="ni-head-actions">
            <div class="ni-switch" role="tablist" aria-label="Empresa">
              ${empresas.map(em => `<button type="button" role="tab" aria-selected="${em === empresaActual}" class="${em === empresaActual ? 'on' : ''} ${em === 'CHIMU' ? 'chimu' : ''}" data-empresa="${e(em)}">${e(em)}</button>`).join('')}
            </div>
            <button type="button" class="ni-close" aria-label="Cerrar">${ic('x')}</button>
          </div>
        </div>
        <div class="ni-head-main">
          <div class="ni-head-copy">
            <span class="business-tag">${e(tag)}</span>
            <h3 id="niTitulo">${e(nombre)}</h3>
            <p>${e(desc)}</p>
          </div>
          <div class="ni-head-meta">
            <span>${ic('calendar')}<small>PERIODO</small><b>${e(DATA.periodo)}</b></span>
            ${d ? `<span>${ic('user-round')}<small>RESPONSABLE</small><b>${e(d.responsable || '—')}</b></span>` : ''}
            ${ejemplo ? `<span class="ni-sample-chip" tabindex="0" data-tip-title="Datos de ejemplo" data-tip="Cifras ilustrativas para validar el diseño. Se reemplazan con la plantilla de datos.">${ic('info')}<b>DATOS DE EJEMPLO</b></span>` : ''}
          </div>
        </div>
      </header>
      <div class="ni-layout">
        <aside class="ni-side">
          <nav class="ni-nav" aria-label="Capítulos">
            ${caps.map((c, i) => `<a href="#${c.id}" class="${i === 0 ? 'on' : ''}" data-cap="${c.id}">
                <span class="ni-nav-ico">${ic(c.icono)}</span>
                <span class="ni-nav-txt"><small>${e(c.kicker)}</small><b>${e(c.nav)}</b></span>
              </a>`).join('')}
            ${caps.length ? '' : `<p class="ni-nav-empty">${ic('clock-3')} Este negocio aún no tiene capítulos para ${e(empresaActual)}.</p>`}
          </nav>
          ${acciones(d, idx, 'side')}
        </aside>
        <main class="ni-main" tabindex="-1">
          ${d ? caps.map(c => c.html).join('') : vacio(nombre)}
          ${acciones(d, idx, 'main')}
        </main>
      </div>`;

    conectar(idx);
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('ni-ready')));
  }

  function acciones(d, idx, donde) {
    return `<div class="ni-actions ni-actions-${donde}">
      ${d && d.area ? `<button type="button" class="ni-pbi" data-area="${e(d.area)}">${ic('arrow-up-right')} Ver dashboards en Power BI</button>` : ''}
      <div class="ni-steps">
        <button type="button" class="ni-step" data-step="-1" aria-label="Negocio anterior: ${e(nombreDe(idx - 1))}">${ic('chevron-left')}<span>${e(nombreDe(idx - 1))}</span></button>
        <button type="button" class="ni-step" data-step="1" aria-label="Negocio siguiente: ${e(nombreDe(idx + 1))}"><span>${e(nombreDe(idx + 1))}</span>${ic('chevron-right')}</button>
      </div>
    </div>`;
  }
  function nombreDe(i) {
    const c = cards[(i + cards.length) % cards.length];
    return c.querySelector('h3')?.textContent.trim() || '';
  }

  function conectar(idx) {
    box.classList.remove('ni-ready');
    box.querySelector('.ni-close').onclick = cerrar;
    box.querySelectorAll('[data-empresa]').forEach(b => b.onclick = () => { empresaActual = b.dataset.empresa; render(); });
    box.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
      const n = (idx + Number(b.dataset.step) + cards.length) % cards.length;
      negocioActual = { card: cards[n], nombre: cards[n].querySelector('h3').textContent.trim() };
      render();
    });
    box.querySelectorAll('.ni-pbi').forEach(b => b.onclick = () => irAnalitica(b.dataset.area));
    box.querySelectorAll('[data-ir]').forEach(b => b.onclick = ev => { ev.preventDefault(); irCapitulo(b.dataset.ir); });
    /* navegación interna */
    const links = [...box.querySelectorAll('.ni-nav a')];
    links.forEach(a => a.onclick = ev => { ev.preventDefault(); irCapitulo(a.dataset.cap); });
    const scrollers = [box.querySelector('.ni-main'), box];
    const spy = () => {
      const secs = [...box.querySelectorAll('.ni-chap')];
      if (!secs.length) return;
      const navH = box.querySelector('.ni-side').getBoundingClientRect().bottom;
      const top = window.matchMedia('(max-width: 900px)').matches ? navH + 20 : box.querySelector('.ni-main').getBoundingClientRect().top + 90;
      let actual = secs[0].id;
      secs.forEach(s => { if (s.getBoundingClientRect().top <= top) actual = s.id; });
      const main = box.querySelector('.ni-main');
      if (main.scrollHeight - main.scrollTop - main.clientHeight < 4 && main.scrollHeight > main.clientHeight) actual = secs[secs.length - 1].id;
      links.forEach(a => a.classList.toggle('on', a.dataset.cap === actual));
      const on = links.find(a => a.classList.contains('on'));
      const nav = box.querySelector('.ni-nav');
      if (on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: on.offsetLeft - 16, behavior: 'smooth' });
    };
    scrollers.forEach(s => s.onscroll = () => { ocultarTip(); spy(); });
    scrollers.forEach(s => (s.scrollTop = 0));
    bindTips();
    bindChart();
  }
  function irCapitulo(id) {
    const s = box.querySelector('#' + id);
    if (s) s.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  function vacio(nombre) {
    return `<div class="ni-empty">
      <div class="ni-empty-icon">${ic('clock-3')}</div>
      <b>Indicadores de ${e(nombre)} · ${e(empresaActual)} en preparación</b>
      <span>La información de este negocio se publicará cuando se complete la carga de datos.</span>
    </div>`;
  }

  /* ================================================================
     CAPÍTULOS
     ================================================================ */
  function capitulos(d) {
    const kp = k => (d.kpis || []).find(x => x.label.toLowerCase().startsWith(k));
    const bloques = d.bloques || [];
    const porCap = cap => bloques.filter(b => (b.capitulo || ({ split: 'entregas', ranking: 'canales', stats: 'resultados' })[b.tipo]) === cap);
    const entregas = porCap('entregas'), canales = porCap('canales'), resultados = porCap('resultados');
    const atencion = puntosAtencion(d);
    const out = [];
    let n = 0;
    const cap = (id, icono, nav, pregunta, lead, cuerpo, numerado = true) => {
      const num = numerado ? String(++n).padStart(2, '0') : '';
      const kicker = numerado ? `CAPÍTULO ${num}` : (id === 'ni-c-lectura' ? 'RESUMEN' : id === 'ni-c-atencion' ? 'ALERTAS' : 'CONTEXTO');
      out.push({ id, icono, nav, kicker, html: `
        <section class="ni-chap" id="${id}">
          <div class="ni-chap-head">
            ${numerado ? `<span class="ni-chap-num">${num}</span>` : `<span class="ni-chap-num ico">${ic(icono)}</span>`}
            <div>
              <small>${e(kicker)} · ${e(nav.toUpperCase())}</small>
              <h4>${e(pregunta)}</h4>
              ${lead ? `<p>${lead}</p>` : ''}
            </div>
          </div>
          ${cuerpo}
        </section>` });
    };

    cap('ni-c-lectura', 'sparkles', 'Lectura rápida', `¿Qué operación estamos observando?`, '', lectura(d, kp, entregas, atencion), false);
    cap('ni-c-flujo', 'workflow', 'La operación', '¿Cómo funciona la operación?',
      'Recorrido conceptual del producto, de principio a fin. Las cifras indican dónde se mide cada etapa.', flujo(d, kp, entregas, canales), false);
    if ((d.kpis || []).length) cap('ni-c-volumen', 'chart-column', 'Volumen', '¿Cuánto movilizamos?',
      'Lo que la operación movió durante el mes, comparado con su promedio mensual.', volumen(d));
    if (d.flota) cap('ni-c-recursos', 'truck', 'Recursos', '¿Con qué recursos operamos?',
      'La flota asignada a este negocio y qué parte de ella está monitoreada.', recursos(d, kp));
    if (entregas.length) cap('ni-c-entregas', entregas[0].capitulo === 'entregas' && /entrega/i.test(entregas[0].pregunta || '') ? 'package-check' : 'layers',
      entregas.length === 1 && /entrega/i.test(entregas[0].pregunta || '') ? 'Entregas' : 'Distribución',
      entregas[0].pregunta || '¿Cómo distribuimos?', 'Cómo se reparte el total entre las alternativas de la operación.', entregas.map(splitCard).join(''));
    if (canales.length) cap('ni-c-canales', 'store', 'Canales', canales[0].pregunta || '¿A qué canales atendemos?',
      'Participación de cada canal de venta, de mayor a menor.', canales.map(rankingCard).join(''));
    if (resultados.length) cap('ni-c-resultados', 'trending-up', 'Resultados', resultados[0].pregunta || '¿Qué resultados obtuvimos?',
      'Indicadores de resultado del periodo y su comparación con el promedio mensual.', resultados.map(b => statsCard(b, kp)).join(''));
    cap('ni-c-atencion', 'circle-alert', 'Atención', '¿Qué información requiere atención?',
      'Puntos detectados automáticamente a partir de los datos cargados.', atencionHtml(atencion), false);
    return out;
  }

  /* ---------- Lectura rápida ---------- */
  function lectura(d, kp, entregas, atencion) {
    const u = kp('unidades'), v = kp('viajes'), km = kp('km'), f = d.flota;
    const items = [];
    if (u) {
      const cu = conUnidad(u.valor, u.unidad);
      items.push([kpiInfo(u).icono, 'Volumen', `Movilizamos <b>${cu.num} ${cu.txt}</b>${v ? ` en <b>${nf(v.valor)} viajes</b>` : ''}${km ? ` y <b>${corto(km.valor)} km</b>` : ''}.`, 'ni-c-volumen']);
    }
    if (f) items.push(['truck', 'Recursos', `Operamos con <b>${nf(f.unidades)} unidades</b>: ${nf(f.propias)} propias y ${nf(f.terceros)} de terceros.`, 'ni-c-recursos']);
    if (entregas[0]) {
      const b = entregas[0], tot = b.partes.reduce((s, p) => s + p.valor, 0) || 1;
      const top = [...b.partes].sort((a, c) => c.valor - a.valor)[0];
      items.push([(GLOSARIO[top.label] || ['layers'])[0], 'Distribución', `${e(b.titulo)}: <b>${e(top.label)}</b> concentra el <b>${pct(top.valor / tot * 100, 0)}</b> del total.`, 'ni-c-entregas']);
    }
    const alertas = atencion.filter(a => a.nivel !== 'info').length;
    items.push(['circle-alert', 'Atención', alertas ? `<b>${alertas} ${alertas === 1 ? 'punto requiere' : 'puntos requieren'} atención</b> en este periodo.` : 'Sin puntos críticos en este periodo.', 'ni-c-atencion']);
    return `<div class="ni-brief">${items.map(([i, k, t, go]) => `
      <a href="#${go}" class="ni-brief-item" data-ir="${go}">
        <span class="ni-brief-ico">${ic(i)}</span>
        <span><small>${e(k.toUpperCase())}</small><span>${t}</span></span>
      </a>`).join('')}</div>`;
  }

  /* ---------- Infografía del flujo ---------- */
  function flujo(d, kp, entregas, canales) {
    const t = kp('tonelada'), v = kp('viajes'), km = kp('km');
    const ind = {
      carga: t ? `${corto(t.valor)} t transportadas` : '',
      transporte: [v ? `${nf(v.valor)} viajes` : '', km ? `${corto(km.valor)} km` : ''].filter(Boolean).join(' · '),
      entrega: (() => {
        const b = entregas[0]; if (!b) return '';
        const tot = b.partes.reduce((s, p) => s + p.valor, 0) || 1;
        return b.partes.map(p => `${p.label} ${pct(p.valor / tot * 100, 0)}`).join(' · ');
      })(),
      destino: canales[0] ? `${canales[0].partes.length} canales de venta` : ''
    };
    const pasos = d.flujo || FLUJO_BASE;
    return `<div class="ni-flow" role="list">
      ${pasos.map((p, i) => `<div class="ni-flow-step" role="listitem">
          <div class="ni-flow-node"><span>${ic(p.icono || 'map-pin')}</span><i>${String(i + 1).padStart(2, '0')}</i></div>
          <b>${e(p.nombre)}</b>
          <p>${e(p.desc)}</p>
          ${ind[p.id] ? `<em>${e(ind[p.id])}</em>` : ''}
        </div>`).join('')}
    </div>
    <p class="ni-note">${ic('info')} Flujo conceptual: resume las etapas generales y puede adaptarse a cada negocio.</p>`;
  }

  /* ---------- 01 Volumen ---------- */
  function volumen(d) {
    const t = d.tendencia;
    const kpis = (d.kpis || []).map(k => kpiCard(k, t)).join('');
    return `<div class="ni-kpis">${kpis}</div>${t ? trendCard(t) : ''}`;
  }
  function delta(valor, base, sentido, refTxt) {
    if (!base) return '';
    const dv = (valor - base) / base * 100;
    const dir = Math.abs(dv) < 0.05 ? 0 : dv > 0 ? 1 : -1;
    const estado = sentido === 'neutral' || dir === 0 ? 'neutral' : (sentido === 'mayor' ? dir > 0 : dir < 0) ? 'fav' : 'desfav';
    const etiqueta = { neutral: '', fav: '<i>Favorable</i>', desfav: '<i>A vigilar</i>' }[estado];
    const flecha = dir > 0 ? ic('trending-up') : dir < 0 ? ic('trending-down') : ic('minus');
    return `<div class="ni-delta ${estado}">${flecha}<span>${dir > 0 ? '+' : dir < 0 ? '−' : ''}${pct(Math.abs(dv))} ${refTxt}</span>${etiqueta}</div>`;
  }
  function kpiCard(k, t) {
    const info = kpiInfo(k), cu = conUnidad(k.valor, k.unidad);
    const serie = t && ((t.unidad === 'viajes' && /^viajes/i.test(k.label)) || (t.unidad === 't' && /^tonelada/i.test(k.label))) ? t.valores : null;
    let micro = '';
    if (serie) micro = `<div class="ni-micro" aria-hidden="true">${sparkline(serie)}<small>Últimos ${serie.length} meses</small></div>`;
    else if (k.promedio) {
      const mx = Math.max(k.valor, k.promedio) || 1;
      micro = `<div class="ni-micro ni-bullet" aria-hidden="true">
        <div><small>Mes</small><span><i style="--w:${k.valor / mx * 100}%"></i></span></div>
        <div><small>Prom.</small><span class="avg"><i style="--w:${k.promedio / mx * 100}%"></i></span></div>
      </div>`;
    }
    return `<article class="ni-kpi" tabindex="0" data-tip-title="${e(info.nombre)}" data-tip="${e(info.def)}">
      <div class="ni-kpi-top"><span class="ni-kpi-ico">${ic(info.icono)}</span><small>${e(info.nombre.toUpperCase())}</small><span class="ni-kpi-help">${ic('info')}</span></div>
      <div class="ni-kpi-val"><strong>${cu.num}</strong><span>${e(cu.txt)}</span></div>
      ${delta(k.valor, k.promedio, info.sentido, 'respecto al promedio mensual')}
      ${micro}
    </article>`;
  }
  function sparkline(v) {
    const W = 120, H = 30, mn = Math.min(...v), mx = Math.max(...v), r = mx - mn || 1;
    const pts = v.map((y, i) => [i / (v.length - 1) * (W - 6) + 3, H - 4 - (y - mn) / r * (H - 8)]);
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="3" fill="currentColor"/></svg>`;
  }

  /* Gráfico de evolución mensual (línea con eje no iniciado en cero, declarado) */
  function trendCard(t) {
    const v = t.valores, m = DATA.meses.slice(-v.length), n = v.length;
    const noun = { viajes: 'Los viajes', t: 'Las toneladas' }[t.unidad] || t.label;
    const ch = (v[n - 1] - v[0]) / v[0] * 100;
    const verbo = Math.abs(ch) < 0.5 ? 'se mantuvieron estables' : ch > 0 ? `crecieron ${pct(ch)}` : `disminuyeron ${pct(Math.abs(ch))}`;
    const iMax = v.indexOf(Math.max(...v)), prom = v.reduce((a, b) => a + b, 0) / n;
    const sub = iMax === n - 1 ? `${mesLargo(m[iMax]).replace(/^./, c => c.toUpperCase())} registra el valor más alto del periodo.` : `El valor más alto se registró en ${mesLargo(m[iMax])} (${nf(v[iMax])} ${unidadLarga(t.unidad)}).`;
    /* geometría */
    const W = 720, H = 240, L = 56, R = 24, T = 28, B = 34;
    const lo = Math.min(...v), hi = Math.max(...v), pad = (hi - lo || hi * .1) * .35;
    const [y0, y1, step] = nice(lo - pad, hi + pad, 4);
    const X = i => L + (n === 1 ? (W - L - R) / 2 : i * (W - L - R) / (n - 1));
    const Y = y => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
    const ticks = []; for (let y = y0; y <= y1 + 1e-9; y += step) ticks.push(y);
    const path = v.map((y, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
    const area = `${path} L${X(n - 1).toFixed(1)},${H - B} L${X(0).toFixed(1)},${H - B} Z`;
    const etiquetar = i => i === 0 || i === n - 1 || i === iMax;
    const colW = (W - L - R) / Math.max(1, n - 1);
    return `<article class="ni-card ni-trend">
      <div class="ni-card-head">
        <div><h5>${e(noun)} ${verbo} entre ${mesLargo(m[0])} y ${mesLargo(m[n - 1])}</h5><p>${e(sub)}</p></div>
        <span class="ni-legend"><i class="line"></i>${e(t.label)} <i class="dash"></i>Promedio ${n} meses: ${nf(prom)}</span>
      </div>
      <div class="ni-chart" data-chart>
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(t.label)}: ${v.map((y, i) => m[i] + ' ' + nf(y)).join(', ')}">
          <defs><linearGradient id="niArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0758a8" stop-opacity=".16"/><stop offset="1" stop-color="#0758a8" stop-opacity="0"/></linearGradient></defs>
          ${ticks.map(y => `<g class="grid"><line x1="${L}" x2="${W - R}" y1="${Y(y)}" y2="${Y(y)}"/><text x="${L - 10}" y="${Y(y) + 4}" text-anchor="end">${corto(y)}</text></g>`).join('')}
          <line class="avg" x1="${L}" x2="${W - R}" y1="${Y(prom)}" y2="${Y(prom)}"/>
          <path class="area" d="${area}"/>
          <path class="line" d="${path}"/>
          <line class="cross" x1="0" x2="0" y1="${T - 6}" y2="${H - B}"/>
          ${v.map((y, i) => `<circle class="pt ${i === n - 1 ? 'now' : ''}" data-i="${i}" cx="${X(i)}" cy="${Y(y)}" r="${i === n - 1 ? 5.5 : 4.5}"/>`).join('')}
          ${v.map((y, i) => etiquetar(i) ? `<text class="lbl ${i === n - 1 ? 'now' : ''}" x="${X(i)}" y="${Y(y) - 12}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${nf(y)}</text>` : '').join('')}
          ${m.map((mm, i) => `<text class="x ${i === n - 1 ? 'now' : ''}" x="${X(i)}" y="${H - 10}" text-anchor="middle">${e(mm)}</text>`).join('')}
          ${v.map((y, i) => `<rect class="hit" data-i="${i}" x="${X(i) - colW / 2}" y="${T - 10}" width="${colW}" height="${H - T - B + 10}" data-tip-title="${e(mesLargo(m[i]).replace(/^./, c => c.toUpperCase()))}" data-tip="${e(nf(y) + ' ' + unidadLarga(t.unidad) + ' · ' + (y >= prom ? '+' : '−') + pct(Math.abs((y - prom) / prom * 100)) + ' vs. promedio')}" data-x="${X(i)}"/>`).join('')}
        </svg>
      </div>
      <p class="ni-note">${ic('info')} El eje vertical no inicia en cero para hacer visible la variación entre meses.</p>
    </article>`;
  }
  function nice(min, max, count) {
    const raw = (max - min) / count, mag = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / mag;
    const step = (r > 5 ? 10 : r > 2 ? 5 : r > 1 ? 2 : 1) * mag;
    return [Math.floor(min / step) * step, Math.ceil(max / step) * step, step];
  }
  function bindChart() {
    box.querySelectorAll('[data-chart]').forEach(ch => {
      const svg = ch.querySelector('svg'), cross = svg.querySelector('.cross');
      svg.querySelectorAll('.hit').forEach(h => {
        const on = () => { cross.setAttribute('x1', h.dataset.x); cross.setAttribute('x2', h.dataset.x); svg.classList.add('hover'); svg.querySelectorAll('.pt').forEach(p => p.classList.toggle('on', p.dataset.i === h.dataset.i)); };
        const off = () => { svg.classList.remove('hover'); svg.querySelectorAll('.pt').forEach(p => p.classList.remove('on')); };
        h.addEventListener('mouseenter', on); h.addEventListener('mouseleave', off);
      });
    });
  }

  /* ---------- 02 Recursos ---------- */
  function recursos(d, kp) {
    const f = d.flota, v = kp('viajes'), km = kp('km');
    const tot = f.unidades || 1, pP = f.propias / tot * 100, pT = f.terceros / tot * 100, gps = Math.round(f.gps / tot * 100);
    const escala = tot > 60 ? Math.ceil(tot / 60) : 1;
    const nP = Math.round(f.propias / escala), nT = Math.round(f.terceros / escala);
    const trucks = Array.from({ length: nP }, () => `<i class="p">${ic('truck')}</i>`).join('') + Array.from({ length: nT }, () => `<i class="t">${ic('truck')}</i>`).join('');
    const C = 2 * Math.PI * 42;
    return `<div class="ni-res">
      <article class="ni-card ni-fleet">
        <div class="ni-card-head"><div><h5>${nf(f.unidades)} unidades asignadas</h5><p>${f.tipo ? `Tipo principal: <b>${e(f.tipo)}</b>` : ''}</p></div>
          <span class="ni-legend"><i class="sw p"></i>${term('Propias', TERM.propias)} <i class="sw t"></i>${term('Terceros', TERM.terceros)}</span></div>
        <div class="ni-trucks" role="img" aria-label="${nf(f.propias)} unidades propias y ${nf(f.terceros)} de terceros">${trucks}</div>
        ${escala > 1 ? `<p class="ni-note">Cada icono representa ${escala} unidades.</p>` : ''}
        <div class="ni-stack" aria-hidden="true">
          <i class="p" style="--w:${pP}%" tabindex="0" data-tip-title="Propias" data-tip="${nf(f.propias)} unidades · ${pct(pP)}"></i>
          <i class="t" style="--w:${pT}%" tabindex="0" data-tip-title="Terceros" data-tip="${nf(f.terceros)} unidades · ${pct(pT)}"></i>
        </div>
        <div class="ni-stack-legend">
          <div><span class="sw p"></span><b>${nf(f.propias)}</b><small>propias · ${pct(pP, 0)}</small></div>
          <div><span class="sw t"></span><b>${nf(f.terceros)}</b><small>de terceros · ${pct(pT, 0)}</small></div>
        </div>
      </article>
      <article class="ni-card ni-gps">
        <div class="ni-card-head"><div><h5>Cobertura de monitoreo</h5><p>${term('GPS / Segurtrack', TERM.gps)}</p></div></div>
        <div class="ni-ring">
          <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" class="bg"/><circle cx="50" cy="50" r="42" class="fg" style="--dash:${C * gps / 100} ${C}"/></svg>
          <div><strong>${gps}%</strong><small>con GPS</small></div>
        </div>
        <p class="ni-ring-txt"><b>${nf(f.gps)} de ${nf(f.unidades)}</b> unidades monitoreadas en tiempo real.</p>
      </article>
      <article class="ni-card ni-photo">
        ${f.imagen ? `<img src="${e(f.imagen)}" alt="Flota de ${e(f.tipo || 'transporte')}">` : `<div class="ni-photo-empty">${ic('image')}<b>Foto de flota</b><small>pendiente</small></div>`}
      </article>
      ${v && km ? `<article class="ni-card ni-derived">
        <div class="ni-derived-item" tabindex="0" data-tip-title="Cálculo" data-tip="Kilómetros recorridos ÷ viajes realizados.">${ic('route')}<div><small>RECORRIDO PROMEDIO POR VIAJE</small><strong>${nf(km.valor / v.valor)} <span>km</span></strong></div><em>Cálculo</em></div>
        <div class="ni-derived-item" tabindex="0" data-tip-title="Cálculo" data-tip="Viajes realizados ÷ unidades asignadas.">${ic('truck')}<div><small>VIAJES POR UNIDAD EN EL MES</small><strong>${nf(v.valor / tot)} <span>viajes</span></strong></div><em>Cálculo</em></div>
      </article>` : ''}
    </div>`;
  }

  /* ---------- 03 Distribución / entregas ---------- */
  function splitCard(b) {
    const tot = b.partes.reduce((s, p) => s + p.valor, 0) || 1;
    const ps = b.partes.map((p, i) => ({ ...p, i, pc: p.valor / tot * 100, g: GLOSARIO[p.label] || ['layers', p.label] }));
    const top = [...ps].sort((a, c) => c.pc - a.pc)[0], low = ps.find(p => p !== top);
    const deCada10 = Math.round(top.pc / 10);
    const lead = low ? `<b>${e(top.label)}</b> concentra el ${pct(top.pc, 0)} del total${deCada10 >= 1 && deCada10 <= 9 ? ` (aprox. ${deCada10} de cada 10)` : ''}; ${e(low.label.toLowerCase())} representa el ${pct(low.pc, 0)}.` : '';
    return `<article class="ni-card ni-split-card">
      <div class="ni-card-head"><div><h5>${e(b.titulo)}</h5><p>${lead}</p></div></div>
      <div class="ni-seg">
        ${ps.map(p => `<div class="seg s${p.i}" style="--w:${p.pc}%" tabindex="0" data-tip-title="${e(p.label)}" data-tip="${e(p.g[1] + ' · ' + pct(p.pc) + (b.unidad === '%' ? '' : ' · ' + nf(p.valor) + ' ' + unidadLarga(b.unidad)))}">
            ${p.pc >= 14 ? `<span>${ic(p.g[0])}${pct(p.pc, 0)}</span>` : ''}</div>`).join('')}
      </div>
      <div class="ni-seg-legend">
        ${ps.map(p => `<div class="ni-seg-item">
          <span class="ni-seg-ico s${p.i}">${ic(p.g[0])}</span>
          <div><b>${pct(p.pc, 0)}</b><span>${term(e(p.label), p.g[1])}${b.unidad === '%' ? '' : ` · ${e(conUnidad(p.valor, b.unidad).num + ' ' + conUnidad(p.valor, b.unidad).txt)}`}</span></div>
        </div>`).join('')}
      </div>
    </article>`;
  }

  /* ---------- 04 Canales ---------- */
  function rankingCard(b) {
    const ps = [...b.partes].sort((a, c) => c.valor - a.valor);
    const tot = ps.reduce((s, p) => s + p.valor, 0) || 1, max = ps[0].valor || 1;
    const top2 = ps.slice(0, 2).reduce((s, p) => s + p.valor, 0) / tot * 100;
    return `<article class="ni-card ni-rank-card">
      <div class="ni-card-head"><div><h5>${e(ps[0].label)} es el principal canal, con ${pct(ps[0].valor / tot * 100, 0)}</h5>
        <p>${ps.length > 2 ? `Los dos primeros canales concentran el ${pct(top2, 0)} del total.` : ''}</p></div>
        <span class="ni-legend">% de participación</span></div>
      <ol class="ni-rank">
        ${ps.map((p, i) => `<li class="${i === 0 ? 'top' : ''}" tabindex="0" data-tip-title="${e(p.label)}" data-tip="${e(pct(p.valor / tot * 100) + ' de participación · puesto ' + (i + 1) + ' de ' + ps.length)}">
          <span class="pos">${i + 1}</span><span class="name">${e(p.label)}</span>
          <span class="bar"><i style="--w:${p.valor / max * 100}%"></i></span>
          <b>${pct(p.valor / tot * 100, 0)}</b></li>`).join('')}
      </ol>
    </article>`;
  }

  /* ---------- 05 Resultados ---------- */
  function statsCard(b, kp) {
    const items = b.items || [];
    const prom = items.find(it => /promedio/i.test(it.label));
    const mes = items.find(it => it !== prom && /mes/i.test(it.label));
    const esVenta = /venta/i.test(b.titulo);
    const val = it => it.moneda ? { num: soles(it.valor), txt: '' } : conUnidad(it.valor, it.unidad);
    const tiles = items.map(it => {
      const vv = val(it);
      const ico = it.moneda ? 'coins' : it.unidad === 't' ? 'scale' : 'chart-column';
      const sufijo = esVenta && it.unidad === 't' ? ' vendidas' : '';
      const dl = it === mes && prom ? delta(it.valor, prom.valor, it.moneda ? 'menor' : esVenta ? 'mayor' : 'neutral', 'respecto al promedio mensual') : '';
      return `<div class="ni-stat ${it === mes ? 'main' : ''}">
        <div class="ni-stat-top">${ic(ico)}<small>${e(it.label.toUpperCase())}</small></div>
        <strong>${e(vv.num)}</strong><span>${e(vv.txt + sufijo)}</span>${dl}
      </div>`;
    }).join('');
    let compara = '';
    if (b.comparaCon) {
      const k = kp(b.comparaCon.toLowerCase().slice(0, 8));
      const venta = mes || items[0];
      if (k && venta) compara = `<div class="ni-compare">
        <div>${ic('weight')}<small>TONELADAS TRANSPORTADAS</small><b>${corto(k.valor)} t</b><span>Carga movida por la flota (capítulo Volumen).</span></div>
        <div class="vs">≠</div>
        <div>${ic('shopping-cart')}<small>TONELADAS VENDIDAS</small><b>${corto(venta.valor)} t</b><span>Volumen comercial registrado en el mes.</span></div>
        <p>Son indicadores distintos: uno mide la operación de transporte y el otro la venta. No deben sumarse ni compararse como equivalentes.</p>
      </div>`;
    }
    return `<article class="ni-card ni-stats-card">
      <div class="ni-card-head"><div><h5>${e(b.titulo)}</h5><p>${b.items.some(i => i.moneda) ? 'Montos en soles (S/).' : esVenta ? 'Unidad: toneladas (t) vendidas.' : ''}</p></div></div>
      <div class="ni-stats">${tiles}</div>
      ${compara}
    </article>`;
  }

  /* ---------- Puntos de atención (reglas sobre los datos, no se inventan) ---------- */
  function puntosAtencion(d) {
    const out = [];
    const f = d.flota;
    (d.kpis || []).forEach(k => {
      if (k.promedio && k.valor < k.promedio) out.push({ nivel: 'info', icono: 'trending-down', txt: `${kpiInfo(k).nombre}: ${pct((k.promedio - k.valor) / k.promedio * 100)} por debajo del promedio mensual.` });
    });
    (d.bloques || []).filter(b => b.tipo === 'stats').forEach(b => {
      const prom = b.items.find(i => /promedio/i.test(i.label)), mes = b.items.find(i => i !== prom && /mes/i.test(i.label));
      if (!prom || !mes) return;
      if (mes.moneda && mes.valor > prom.valor) out.push({ nivel: 'vigilar', icono: 'coins', txt: `${b.titulo}: el costo del mes supera en ${pct((mes.valor - prom.valor) / prom.valor * 100)} al promedio mensual.` });
      if (!mes.moneda && /venta/i.test(b.titulo) && mes.valor < prom.valor) out.push({ nivel: 'vigilar', icono: 'trending-down', txt: `${b.titulo}: la venta del mes está ${pct((prom.valor - mes.valor) / prom.valor * 100)} por debajo del promedio.` });
    });
    if (f && f.gps < f.unidades) out.push({ nivel: 'vigilar', icono: 'satellite', txt: `${nf(f.unidades - f.gps)} unidades sin monitoreo GPS / Segurtrack.` });
    if (f && !f.imagen) out.push({ nivel: 'pendiente', icono: 'image', txt: 'Foto de la flota pendiente de cargar.' });
    if (!d.responsable || /confirmar/i.test(d.responsable)) out.push({ nivel: 'pendiente', icono: 'user-round', txt: 'Responsable de datos por confirmar.' });
    if (DATA.ejemplo) out.push({ nivel: 'info', icono: 'info', txt: 'Las cifras mostradas son de ejemplo y deben reemplazarse con datos reales.' });
    return out;
  }
  function atencionHtml(lista) {
    const orden = { vigilar: 0, pendiente: 1, info: 2 };
    const ETQ = { vigilar: 'A vigilar', pendiente: 'Dato pendiente', info: 'Información' };
    if (!lista.length) return `<div class="ni-ok">${ic('circle-check')} Sin puntos que requieran atención.</div>`;
    return `<ul class="ni-alerts">${[...lista].sort((a, b) => orden[a.nivel] - orden[b.nivel]).map(a => `
      <li class="${a.nivel}"><span class="ni-alert-ico">${ic(a.icono)}</span><span class="txt">${e(a.txt)}</span><em>${ETQ[a.nivel]}</em></li>`).join('')}</ul>`;
  }

  /* ---------------- tooltip reutilizable ---------------- */
  function ocultarTip() { tip.classList.remove('show'); }
  function bindTips() {
    box.querySelectorAll('[data-tip]').forEach(el => {
      const show = () => {
        tip.querySelector('b').textContent = el.dataset.tipTitle || '';
        tip.querySelector('b').style.display = el.dataset.tipTitle ? '' : 'none';
        tip.querySelector('span').textContent = el.dataset.tip;
        tip.classList.add('show');
        const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
        let top = r.top - h - 10;
        if (top < 8) top = r.bottom + 10;
        tip.style.left = Math.min(innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2)) + 'px';
        tip.style.top = top + 'px';
      };
      el.addEventListener('mouseenter', show); el.addEventListener('focus', show);
      el.addEventListener('mouseleave', ocultarTip); el.addEventListener('blur', ocultarTip);
    });
  }

  /* ---------------- enlace a Analítica ---------------- */
  function irAnalitica(area) {
    cerrar();
    const co = document.getElementById('aCompany'), ar = document.getElementById('aArea');
    if (co && [...co.options].some(o => o.value === empresaActual)) co.value = empresaActual;
    if (ar && [...ar.options].some(o => o.value === area)) ar.value = area;
    co?.dispatchEvent(new Event('change'));
    const sec = document.getElementById('analitica');
    sec?.classList.remove('is-collapsed');
    sec?.querySelector('.area-row')?.classList.add('open');
    sec?.scrollIntoView({ behavior: 'smooth' });
  }
})();
