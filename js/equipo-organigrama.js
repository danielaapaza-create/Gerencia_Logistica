/* Quiénes somos: las tarjetas con data-org giran y muestran el equipo del líder;
   "Ver organigrama" lo abre en grande. Datos: js/organigramas-datos.js. */
(function () {
  if (typeof organigramas === 'undefined') return;
  const ico = (n, c) => (typeof icono === 'function' ? icono(n, c) : '');
  const h = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const ini = n => String(n).split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const nombreCorto = n => { const p = String(n).split(/\s+/); return p.length > 3 ? p[0] + ' ' + p[p.length - 2] : p.length === 3 ? p[0] + ' ' + p[1] : n; };
  const peso = c => (/supervisor|coordinador de operaciones/i.test(c) ? 0 : /asistente de operaciones/i.test(c) ? 1 : 2);

  function porSede(org) {
    const sedes = [];
    org.equipo.forEach(p => {
      let s = sedes.find(x => x.nombre === p.sede);
      if (!s) sedes.push(s = { nombre: p.sede, personas: [] });
      s.personas.push(p);
    });
    sedes.forEach(s => s.personas.sort((a, b) => peso(a.cargo) - peso(b.cargo) || a.cargo.localeCompare(b.cargo, 'es') || a.nombre.localeCompare(b.nombre, 'es')));
    return sedes.sort((a, b) => b.personas.length - a.personas.length);
  }

  // ------------------------------------------------------------ tarjeta que gira
  document.querySelectorAll('.person-card[data-org]').forEach(card => {
    const org = organigramas[card.dataset.org]; if (!org) return;
    const sedes = porSede(org);
    const front = document.createElement('div'); front.className = 'pc-front';
    while (card.firstChild) front.appendChild(card.firstChild);
    const back = document.createElement('div'); back.className = 'pc-back'; back.setAttribute('aria-hidden', 'true'); back.inert = true;
    back.innerHTML =
      '<div class="pc-back-head"><span class="pc-back-ico">' + ico('network') + '</span><div><b>Equipo de ' + h(org.lider.nombre.split(' ')[0]) + '</b>' +
        '<span>' + org.equipo.length + ' personas · ' + sedes.length + ' sedes</span></div></div>' +
      '<div class="pc-back-list">' + sedes.map(s =>
        '<section><h4>' + ico('map-pin') + h(s.nombre) + ' <em>' + s.personas.length + '</em></h4><ul>' +
        s.personas.map(p => '<li><span class="pc-av">' + h(ini(p.nombre)) + '</span><span><b>' + h(nombreCorto(p.nombre)) + '</b><small>' + h(p.cargo) + '</small></span></li>').join('') +
        '</ul></section>').join('') + '</div>' +
      '<div class="pc-back-foot"><button type="button" class="pc-btn pc-ver">' + ico('maximize-2') + 'Ver organigrama</button>' +
        '<button type="button" class="pc-btn pc-volver" aria-label="Volver a la foto">' + ico('rotate-ccw') + 'Volver</button></div>';
    const inner = document.createElement('div'); inner.className = 'pc-inner';
    inner.append(front, back); card.appendChild(inner);
    card.classList.add('has-org');

    const copy = front.querySelector('.person-copy');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'pc-btn pc-equipo'; btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = ico('users') + 'Ver equipo (' + org.equipo.length + ')';
    copy.insertBefore(btn, copy.querySelector('.person-quote'));
    const foto = front.querySelector('.person-photo');
    foto.insertAdjacentHTML('beforeend', '<span class="pc-hint" aria-hidden="true">' + ico('network') + 'Ver equipo</span>');

    function girar(v) {
      card.classList.toggle('is-flipped', v);
      btn.setAttribute('aria-expanded', String(v));
      back.setAttribute('aria-hidden', String(!v)); back.inert = !v;
      front.setAttribute('aria-hidden', String(v)); front.inert = v;
      (v ? back.querySelector('.pc-ver') : btn).focus({ preventScroll: true });
    }
    btn.addEventListener('click', () => girar(true));
    foto.addEventListener('click', () => girar(true));
    back.querySelector('.pc-volver').addEventListener('click', () => girar(false));
    back.querySelector('.pc-ver').addEventListener('click', () => abrirModal(org, back.querySelector('.pc-ver')));
    card.addEventListener('keydown', e => { if (e.key === 'Escape' && card.classList.contains('is-flipped')) girar(false); });
  });

  // ------------------------------------------------------------ organigrama completo
  let modal, volverA;
  function abrirModal(org, origen) {
    volverA = origen;
    const sedes = porSede(org);
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'og-modal'; modal.hidden = true;
      modal.innerHTML = '<div class="og-box" role="dialog" aria-modal="true" aria-labelledby="ogTitulo"><button type="button" class="og-cerrar" aria-label="Cerrar">' + ico('x') + '</button><div class="og-cuerpo"></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.og-cerrar')) cerrar(); });
      document.addEventListener('keydown', e => { if (!modal.hidden && e.key === 'Escape') { e.stopPropagation(); cerrar(); } }, true);
    }
    modal.querySelector('.og-cuerpo').innerHTML =
      '<p class="og-kicker">Organigrama</p><h3 id="ogTitulo">Equipo de ' + h(org.lider.nombre) + '</h3>' +
      '<p class="og-sub">' + org.equipo.length + ' personas reportan directamente · ' + sedes.length + ' sedes' + (org.fuente ? ' · Fuente: ' + h(org.fuente) : '') + '</p>' +
      '<div class="og-arbol">' +
        '<div class="og-lider"><span class="og-av lg">' + h(ini(org.lider.nombre)) + '</span><div><b>' + h(org.lider.nombre) + '</b><small>' + h(org.lider.cargo) + '</small><small>' + h(org.lider.area || '') + '</small></div></div>' +
        '<div class="og-ramas">' + sedes.map(s =>
          '<section class="og-rama"><h4>' + ico('building-2') + h(s.nombre) + '<em>' + s.personas.length + '</em></h4><ul>' +
          s.personas.map(p => '<li class="' + (peso(p.cargo) === 0 ? 'sup' : '') + '"><span class="og-av">' + h(ini(p.nombre)) + '</span><span><b>' + h(p.nombre) + '</b><small>' + h(p.cargo) + '</small></span></li>').join('') +
          '</ul></section>').join('') + '</div>' +
      '</div>';
    modal.hidden = false; document.body.style.overflow = 'hidden';
    modal.querySelector('.og-cerrar').focus();
  }
  function cerrar() { modal.hidden = true; document.body.style.overflow = ''; if (volverA) volverA.focus({ preventScroll: true }); }
})();
