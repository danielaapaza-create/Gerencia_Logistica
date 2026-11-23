/* ============================================================================
   LOGIXSC+ · Lectura de datos/LOGIXSC_Datos_Fichas.xlsx en el navegador
   ----------------------------------------------------------------------------
   - Lector .xlsx mínimo, sin librerías: un .xlsx es un ZIP con archivos XML.
     Usa DecompressionStream (Chrome/Edge 103+, Firefox 113+, Safari 16.4+).
   - cargarFichasExcel(url) devuelve la misma estructura que js/negocios-datos.js.
   - Si algo falla, devuelve un error y la ficha usa el respaldo de
     js/negocios-datos.js (el portal no se rompe).
   ========================================================================== */
(function () {
  const dec = new TextDecoder();

  /* ---------------- lector ZIP + XML ---------------- */
  async function leerXlsx(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error('No se pudo descargar ' + url + ' (HTTP ' + res.status + ')');
    const buf = new Uint8Array(await res.arrayBuffer());
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let eocd = -1;
    for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('El archivo no es un .xlsx válido');
    const total = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const entradas = {};
    for (let k = 0; k < total; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('ZIP dañado');
      const metodo = dv.getUint16(p + 10, true), tam = dv.getUint32(p + 20, true);
      const ln = dv.getUint16(p + 28, true), le = dv.getUint16(p + 30, true), lc = dv.getUint16(p + 32, true);
      const off = dv.getUint32(p + 42, true);
      entradas[dec.decode(buf.subarray(p + 46, p + 46 + ln))] = { metodo, tam, off };
      p += 46 + ln + le + lc;
    }
    async function texto(nombre) {
      const f = entradas[nombre];
      if (!f) return null;
      const ini = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true);
      const datos = buf.subarray(ini, ini + f.tam);
      if (f.metodo === 0) return dec.decode(datos);
      if (f.metodo !== 8) throw new Error('Compresión no soportada en ' + nombre);
      const flujo = new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return dec.decode(await new Response(flujo).arrayBuffer());
    }
    const xml = s => new DOMParser().parseFromString(s, 'application/xml');
    const tags = (n, t) => Array.from(n.getElementsByTagName(t));

    const wb = xml(await texto('xl/workbook.xml'));
    const rels = xml(await texto('xl/_rels/workbook.xml.rels'));
    const destino = {};
    tags(rels, 'Relationship').forEach(r => { destino[r.getAttribute('Id')] = r.getAttribute('Target'); });
    const ssTxt = await texto('xl/sharedStrings.xml');
    const compartidas = ssTxt ? tags(xml(ssTxt), 'si').map(si => tags(si, 't').filter(t => t.parentNode.nodeName !== 'rPh').map(t => t.textContent).join('')) : [];

    const col = ref => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
    const hojas = {};
    for (const s of tags(wb, 'sheet')) {
      const rid = s.getAttribute('r:id') || s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
      let ruta = destino[rid] || '';
      ruta = ruta.startsWith('/') ? ruta.slice(1) : 'xl/' + ruta.replace(/^\.\//, '');
      const doc = xml(await texto(ruta));
      const filas = [];
      tags(doc, 'row').forEach(row => {
        const r = Number(row.getAttribute('r')) - 1, fila = [];
        tags(row, 'c').forEach(c => {
          const t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0];
          let val = null;
          if (t === 's') val = v ? compartidas[Number(v.textContent)] : null;
          else if (t === 'inlineStr') val = tags(c, 't').map(x => x.textContent).join('');
          else if (t === 'str' || t === 'e') val = v ? v.textContent : null;
          else if (t === 'b') val = v ? v.textContent === '1' : null;
          else val = v ? Number(v.textContent) : null;
          fila[col(c.getAttribute('r'))] = val;
        });
        filas[r] = fila;
      });
      hojas[s.getAttribute('name')] = filas;
    }
    return hojas;
  }

  /* ---------------- tablas: encabezado → objetos ---------------- */
  const limpio = v => (v === null || v === undefined) ? '' : String(v).trim();
  function tabla(hojas, nombre, primera) {
    const filas = hojas[nombre];
    if (!filas) throw new Error('Falta la hoja "' + nombre + '"');
    const h = filas.findIndex(f => f && limpio(f[0]) === primera);
    if (h < 0) throw new Error('No se encontró el encabezado de la hoja "' + nombre + '"');
    const cab = filas[h].map(limpio);
    const out = [];
    for (let i = h + 1; i < filas.length; i++) {
      const f = filas[i];
      if (!f || !f.some(v => limpio(v) !== '')) continue;
      const o = { _fila: i + 1 };
      cab.forEach((c, j) => { if (c) o[c] = f[j]; });
      out.push(o);
    }
    return out;
  }
  function numero(v, ctx, avisos) {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return v;
    const n = Number(String(v).replace(/[^\d.\-]/g, ''));
    if (Number.isNaN(n)) { avisos.push(ctx + ': "' + v + '" no es un número'); return null; }
    return n;
  }
  const si = v => /^s[ií]$/i.test(limpio(v));
  const porOrden = (a, b) => (Number(a.Orden) || 0) - (Number(b.Orden) || 0);

  /* ---------------- conversión a la estructura de las fichas ---------------- */
  function convertir(hojas) {
    const avisos = [];
    const cfg = {};
    tabla(hojas, 'Config', 'Clave').forEach(r => { cfg[limpio(r.Clave)] = limpio(r.Valor); });
    const datos = { ejemplo: si(cfg['Datos de ejemplo']), periodo: cfg['Periodo'] || '', fuentes: {}, meses: [], empresas: {} };
    Object.keys(cfg).filter(k => k.startsWith('Fuente ')).forEach(k => { datos.fuentes[k.slice(7)] = cfg[k]; });

    const clave = r => limpio(r.Empresa) + '|' + limpio(r.Negocio);
    const negocio = {};
    tabla(hojas, 'Negocios', 'Empresa').forEach(r => {
      const emp = limpio(r.Empresa), neg = limpio(r.Negocio);
      if (!emp || !neg) return;
      datos.empresas[emp] = datos.empresas[emp] || {};
      if (limpio(r.Mostrar) && !si(r.Mostrar)) { datos.empresas[emp][neg] = { noAplica: true }; return; }
      const d = { responsable: limpio(r.Responsable) || 'Por confirmar', kpis: [], bloques: [], pendientes: [] };
      if (limpio(r['Área en Power BI'])) d.area = limpio(r['Área en Power BI']);
      datos.empresas[emp][neg] = d;
      negocio[emp + '|' + neg] = d;
    });
    const de = (r, hoja) => {
      const d = negocio[clave(r)];
      if (!d) avisos.push(hoja + ' fila ' + r._fila + ': "' + clave(r).replace('|', ' / ') + '" no está en la hoja Negocios (o tiene Mostrar = No)');
      return d;
    };

    tabla(hojas, 'KPIs', 'Empresa').sort(porOrden).forEach(r => {
      const d = de(r, 'KPIs'); if (!d) return;
      const valor = numero(r.Valor, 'KPIs fila ' + r._fila, avisos); if (valor === null) return;
      const k = { label: limpio(r.Indicador), titulo: limpio(r.Indicador), valor, unidad: limpio(r.Unidad), nota: limpio(r['Periodo / nota']) };
      if (limpio(r['Ícono'])) k.icono = limpio(r['Ícono']);
      if (limpio(r['Definición'])) k.def = limpio(r['Definición']);
      d.kpis.push(k);
    });

    tabla(hojas, 'Flota', 'Empresa').forEach(r => {
      const d = de(r, 'Flota'); if (!d) return;
      const unidades = numero(r.Unidades, 'Flota fila ' + r._fila, avisos); if (unidades === null) return;
      d.flota = { unidades, composicion: [], tipo: limpio(r['Tipo de unidad']), detalle: limpio(r.Detalle), imagen: limpio(r['Foto (ruta)']) };
      const gps = numero(r['Unidades con GPS'], 'Flota fila ' + r._fila, avisos);
      if (gps !== null) d.flota.gps = gps;
    });
    tabla(hojas, 'Flota_Composicion', 'Empresa').sort(porOrden).forEach(r => {
      const d = de(r, 'Flota_Composicion'); if (!d) return;
      if (!d.flota) { avisos.push('Flota_Composicion fila ' + r._fila + ': falta el total en la hoja Flota'); return; }
      const valor = numero(r.Unidades, 'Flota_Composicion fila ' + r._fila, avisos); if (valor === null) return;
      d.flota.composicion.push({ label: limpio(r['Categoría']), valor });
    });

    const bloques = {};
    tabla(hojas, 'Bloques', 'Empresa').sort(porOrden).forEach(r => {
      const d = de(r, 'Bloques'); if (!d) return;
      const tipo = limpio(r.Tipo).toLowerCase();
      if (!['split', 'ranking', 'stats'].includes(tipo)) { avisos.push('Bloques fila ' + r._fila + ': tipo "' + r.Tipo + '" no válido'); return; }
      const b = { tipo, capitulo: limpio(r['Capítulo']), pregunta: limpio(r['Pregunta del capítulo']), titulo: limpio(r['Título']) };
      if (tipo === 'stats') b.items = []; else { b.unidad = limpio(r.Unidad); b.partes = []; }
      if (tipo === 'ranking' && limpio(r['Sustantivo (ranking)'])) b.sustantivo = limpio(r['Sustantivo (ranking)']);
      if (limpio(r.Nota)) b.nota = limpio(r.Nota);
      bloques[limpio(r['ID bloque'])] = b;
      d.bloques.push(b);
    });
    tabla(hojas, 'Bloques_Valores', 'ID bloque').sort(porOrden).forEach(r => {
      const b = bloques[limpio(r['ID bloque'])];
      if (!b) { avisos.push('Bloques_Valores fila ' + r._fila + ': el ID "' + limpio(r['ID bloque']) + '" no existe en Bloques'); return; }
      const valor = numero(r.Valor, 'Bloques_Valores fila ' + r._fila, avisos); if (valor === null) return;
      const label = limpio(r.Etiqueta);
      if (b.tipo !== 'stats') { b.partes.push({ label, valor }); return; }
      const it = { label, valor };
      if (si(r['Moneda (S/)'])) it.moneda = true;
      const decs = numero(r.Decimales, 'Bloques_Valores fila ' + r._fila, avisos);
      if (decs !== null) it.decimales = decs;
      if (limpio(r.Unidad)) it.unidad = limpio(r.Unidad);
      if (limpio(r.Nota)) it.nota = limpio(r.Nota);
      b.items.push(it);
    });
    Object.values(negocio).forEach(d => { d.bloques = d.bloques.filter(b => (b.partes || b.items).length); });

    tabla(hojas, 'Flujo', 'Empresa').sort(porOrden).forEach(r => {
      const d = de(r, 'Flujo'); if (!d) return;
      (d.flujo = d.flujo || []).push({ icono: limpio(r['Ícono']) || 'map-pin', nombre: limpio(r.Etapa), desc: limpio(r['Descripción']), dato: limpio(r.Dato) });
    });
    tabla(hojas, 'Pendientes', 'Empresa').forEach(r => {
      const d = de(r, 'Pendientes'); if (!d) return;
      if (limpio(r.Texto)) d.pendientes.push(limpio(r.Texto));
    });

    if (!Object.keys(negocio).length) throw new Error('El Excel no tiene negocios con datos');
    return { datos, avisos };
  }

  window.cargarFichasExcel = async function (url) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador no puede leer el Excel (falta DecompressionStream)');
    const { datos, avisos } = convertir(await leerXlsx(url));
    if (avisos.length) console.warn('[LOGIXSC+] Avisos al leer ' + url + ':\n- ' + avisos.join('\n- '));
    return datos;
  };
})();
