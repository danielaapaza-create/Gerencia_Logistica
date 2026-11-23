/* LOGIXSC+ · Ficha de indicadores por negocio.
   Al hacer clic en una tarjeta de "Nuestros negocios" se abre la ficha con los
   indicadores del negocio (datos en js/negocios-datos.js). */
(function () {
  const DATA = typeof negociosIndicadores !== 'undefined' ? negociosIndicadores : null;
  const cards = [...document.querySelectorAll('#negocios .business')];
  if (!DATA || !cards.length) return;

  const e = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  const nf = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
  function corto(n) {
    const a = Math.abs(n);
    if (a >= 1e6) return (n / 1e6).toLocaleString('es-PE', { maximumFractionDigits: 2 }) + ' M';
    if (a >= 1e4) return (n / 1e3).toLocaleString('es-PE', { maximumFractionDigits: 1 }) + ' mil';
    return nf.format(n);
  }
  const soles = n => 'S/ ' + corto(n);
  const empresas = Object.keys(DATA.empresas);
  let empresaActual = empresas[0], negocioActual = null, ultimoFoco = null;

  /* ---------- modal ---------- */
  const modal = document.createElement('div');
  modal.className = 'ni-modal';
  modal.id = 'negocioModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'niTitulo');
  modal.innerHTML = '<div class="ni-box"><div class="ni-content"></div></div><div class="ni-tip" role="tooltip"></div>';
  document.body.appendChild(modal);
  const box = modal.querySelector('.ni-content');
  const tip = modal.querySelector('.ni-tip');

  /* ---------- tarjetas: llamada a la acción ---------- */
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
    modal.querySelector('.ni-close')?.focus();
  }
  function cerrar() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    tip.classList.remove('show');
    ultimoFoco?.focus();
  }
  modal.addEventListener('click', ev => { if (ev.target === modal) cerrar(); });
  window.addEventListener('keydown', ev => {
    if (!modal.classList.contains('show')) return;
    if (ev.key === 'Escape') cerrar();
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') ev.stopPropagation();
  }, true);

  /* ---------- render ---------- */
  function render() {
    const { card, nombre } = negocioActual;
    const img = card.querySelector('img')?.getAttribute('src') || '';
    const tag = card.querySelector('.business-tag')?.textContent.trim() || '';
    const desc = card.querySelector('p')?.textContent.trim() || '';
    const d = (DATA.empresas[empresaActual] || {})[nombre];
    const idx = cards.findIndex(c => c === card);

    box.innerHTML = `
      <header class="ni-hero" style="background-image:linear-gradient(90deg,rgba(3,25,55,.97) 0%,rgba(3,25,55,.86) 42%,rgba(3,25,55,.35) 100%),url('${e(img)}')">
        <div class="ni-hero-top">
          <div class="ni-switch" role="tablist" aria-label="Empresa">
            ${empresas.map(em => `<button type="button" role="tab" aria-selected="${em === empresaActual}" class="${em === empresaActual ? 'on' : ''} ${em === 'CHIMU' ? 'chimu' : ''}" data-empresa="${e(em)}">${e(em)}</button>`).join('')}
          </div>
          <button type="button" class="ni-close" aria-label="Cerrar">×</button>
        </div>
        <div class="ni-hero-copy">
          <span class="business-tag">${e(tag)}</span>
          <h3 id="niTitulo">${e(nombre)}</h3>
          <p>${e(desc)}</p>
        </div>
        <div class="ni-hero-meta">
          <span><small>PERIODO</small><b>${e(DATA.periodo)}</b></span>
          ${d ? `<span><small>RESPONSABLE</small><b>${e(d.responsable || '—')}</b></span>` : ''}
        </div>
      </header>
      ${DATA.ejemplo && d ? '<div class="ni-sample"><b>DATOS DE EJEMPLO</b> Cifras ilustrativas para validar el diseño. Se reemplazan con la plantilla de datos.</div>' : ''}
      <div class="ni-body">${d ? cuerpo(d) : vacio(nombre)}</div>
      <footer class="ni-foot">
        <button type="button" class="ni-nav" data-step="-1" aria-label="Negocio anterior">‹ ${e(nombreDe(idx - 1))}</button>
        ${d && d.area ? `<button type="button" class="ni-link" data-area="${e(d.area)}">VER DASHBOARDS EN POWER BI ↗</button>` : '<span></span>'}
        <button type="button" class="ni-nav" data-step="1" aria-label="Negocio siguiente">${e(nombreDe(idx + 1))} ›</button>
      </footer>`;

    box.querySelector('.ni-close').onclick = cerrar;
    box.querySelectorAll('[data-empresa]').forEach(b => b.onclick = () => { empresaActual = b.dataset.empresa; render(); });
    box.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
      const n = (idx + Number(b.dataset.step) + cards.length) % cards.length;
      negocioActual = { card: cards[n], nombre: cards[n].querySelector('h3').textContent.trim() };
      render(); box.parentElement.scrollTop = 0;
    });
    const link = box.querySelector('.ni-link');
    if (link) link.onclick = () => irAnalitica(link.dataset.area);
    bindTips();
  }
  function nombreDe(i) {
    const c = cards[(i + cards.length) % cards.length];
    return c.querySelector('h3')?.textContent.trim() || '';
  }

  function vacio(nombre) {
    return `<div class="ni-empty">
      <div class="ni-empty-icon">…</div>
      <b>Indicadores de ${e(nombre)} · ${e(empresaActual)} en preparación</b>
      <span>La información de este negocio se publicará cuando se complete la carga de datos.</span>
    </div>`;
  }

  function cuerpo(d) {
    const kpis = (d.kpis || []).map((k, i) => {
      const delta = k.promedio ? (k.valor - k.promedio) / k.promedio : null;
      return `<div class="ni-kpi ${i % 2 ? 'alt' : ''}">
        <small>${e(k.label.toUpperCase())}</small>
        <strong>${e(corto(k.valor))}</strong>
        <span>${e(k.unidad)}${k.promedio ? ` · prom. mensual ${e(corto(k.promedio))}` : ''}</span>
        ${delta !== null ? `<em class="${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta * 100).toLocaleString('es-PE', { maximumFractionDigits: 1 })}% vs. promedio</em>` : ''}
      </div>`;
    }).join('');

    const bloques = (d.bloques || []).map(bloque).join('');
    return `
      <div class="ni-kicker">INDICADORES DEL MES</div>
      <div class="ni-kpis">${kpis}</div>
      <div class="ni-grid">
        ${d.tendencia ? tendencia(d.tendencia) : ''}
        ${d.flota ? flota(d.flota) : ''}
        ${bloques}
      </div>`;
  }

  function tendencia(t) {
    const max = Math.max(...t.valores) || 1;
    const n = t.valores.length;
    return `<section class="ni-card ni-trend">
      <div class="ni-card-head"><b>${e(t.label)}</b><span>Últimos ${n} meses</span></div>
      <div class="ni-bars" role="list">
        ${t.valores.map((v, i) => `<div class="ni-bar-col ${i === n - 1 ? 'now' : ''}" role="listitem" tabindex="0"
              data-tip="${e((DATA.meses[i] || '') + ': ' + nf.format(v) + ' ' + t.unidad)}"
              aria-label="${e((DATA.meses[i] || '') + ': ' + nf.format(v) + ' ' + t.unidad)}">
            <span class="ni-bar-val">${i === n - 1 ? e(corto(v)) : ''}</span>
            <i style="height:${Math.max(4, (v / max) * 100)}%"></i>
            <small>${e(DATA.meses[i] || '')}</small>
          </div>`).join('')}
      </div>
    </section>`;
  }

  function flota(f) {
    const gpsPct = f.unidades ? Math.round((f.gps / f.unidades) * 100) : 0;
    return `<section class="ni-card ni-fleet">
      <div class="ni-card-head"><b>Flota asignada</b><span>${e(f.tipo || '')}</span></div>
      <div class="ni-fleet-row">
        <div class="ni-fleet-photo">${f.imagen ? `<img src="${e(f.imagen)}" alt="Flota ${e(f.tipo || '')}">` : '<span>FOTO DE FLOTA<br><small>pendiente</small></span>'}</div>
        <div class="ni-fleet-stats">
          <div><strong>${nf.format(f.unidades)}</strong><small>UNIDADES</small></div>
          <div><strong>${nf.format(f.propias)}</strong><small>PROPIAS</small></div>
          <div><strong>${nf.format(f.terceros)}</strong><small>TERCEROS</small></div>
        </div>
      </div>
      <div class="progress-head"><span>CON GPS / SEGURTRACK</span><span>${gpsPct}%</span></div>
      <div class="progress"><i style="width:${gpsPct}%"></i></div>
    </section>`;
  }

  function fmt(v, unidad, moneda) {
    if (moneda) return soles(v);
    if (unidad === '%') return v.toLocaleString('es-PE', { maximumFractionDigits: 1 }) + '%';
    return corto(v) + (unidad ? ' ' + unidad : '');
  }

  function bloque(b) {
    if (b.tipo === 'split') {
      const total = b.partes.reduce((s, p) => s + p.valor, 0) || 1;
      return `<section class="ni-card">
        <div class="ni-card-head"><b>${e(b.titulo)}</b><span>Participación</span></div>
        <div class="ni-split">
          ${b.partes.map((p, i) => {
            const pct = (p.valor / total) * 100;
            return `<i class="s${i}" style="width:${pct}%" tabindex="0" data-tip="${e(p.label + ': ' + fmt(p.valor, b.unidad) + (b.unidad === '%' ? '' : ' · ' + pct.toFixed(1) + '%'))}"></i>`;
          }).join('')}
        </div>
        <div class="ni-split-legend">
          ${b.partes.map((p, i) => {
            const pct = (p.valor / total) * 100;
            return `<div><span class="dot s${i}"></span><b>${pct.toLocaleString('es-PE', { maximumFractionDigits: 1 })}%</b><small>${e(p.label)}${b.unidad === '%' ? '' : ' · ' + e(fmt(p.valor, b.unidad))}</small></div>`;
          }).join('')}
        </div>
      </section>`;
    }
    if (b.tipo === 'ranking') {
      const partes = [...b.partes].sort((a, c) => c.valor - a.valor);
      const max = partes[0]?.valor || 1;
      return `<section class="ni-card">
        <div class="ni-card-head"><b>${e(b.titulo)}</b><span>% del total</span></div>
        <div class="ni-rank">
          ${partes.map(p => `<div class="ni-rank-row" tabindex="0" data-tip="${e(p.label + ': ' + fmt(p.valor, b.unidad))}">
            <span>${e(p.label)}</span>
            <div class="ni-rank-track"><i style="width:${(p.valor / max) * 100}%"></i></div>
            <b>${e(fmt(p.valor, b.unidad))}</b>
          </div>`).join('')}
        </div>
      </section>`;
    }
    if (b.tipo === 'stats') {
      return `<section class="ni-card">
        <div class="ni-card-head"><b>${e(b.titulo)}</b></div>
        <div class="ni-stats">
          ${b.items.map(it => `<div><small>${e(it.label.toUpperCase())}</small><strong>${e(fmt(it.valor, it.unidad, it.moneda))}</strong></div>`).join('')}
        </div>
      </section>`;
    }
    return '';
  }

  /* ---------- tooltip ---------- */
  function bindTips() {
    box.querySelectorAll('[data-tip]').forEach(el => {
      const show = () => {
        tip.textContent = el.dataset.tip;
        const r = el.getBoundingClientRect();
        tip.classList.add('show');
        const w = tip.offsetWidth;
        tip.style.left = Math.min(innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2)) + 'px';
        tip.style.top = Math.max(8, r.top - tip.offsetHeight - 8) + 'px';
      };
      const hide = () => tip.classList.remove('show');
      el.addEventListener('mouseenter', show); el.addEventListener('focus', show);
      el.addEventListener('mouseleave', hide); el.addEventListener('blur', hide);
    });
    box.parentElement.onscroll = () => tip.classList.remove('show');
  }

  /* ---------- enlace a Analítica ---------- */
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
