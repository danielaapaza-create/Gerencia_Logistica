/* ============================================================================
   LOGIXSC+ · Indicadores por negocio (ficha que se abre desde "Nuestros negocios")
   ----------------------------------------------------------------------------
   - Las claves de cada negocio deben coincidir con el título de su tarjeta.
   - "ejemplo: true" muestra el aviso "DATOS DE EJEMPLO" en la ficha.
     Cámbialo a false cuando cargues los datos reales.
   - Si un negocio no tiene datos para una empresa, la ficha muestra
     "Indicadores en preparación".
   - Tipos de bloque:
       split   → composición de 2 partes (barra 100 %), p. ej. ensacado vs tolvas
       ranking → participación por canal (barras horizontales)
       stats   → cifras sueltas (costos, promedios)
   - capitulo / pregunta (opcionales): en qué capítulo de la ficha se muestra el
     bloque (entregas, canales, resultados) y la pregunta que responde.
   - flujo (opcional por negocio): reemplaza el flujo conceptual
     ORIGEN → CARGA → TRANSPORTE → ENTREGA → DESTINO con etapas propias.
   ========================================================================== */
const negociosIndicadores = {
  ejemplo: true,
  periodo: 'Octubre 2026',
  meses: ['May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct'],
  empresas: {
    'SAN FERNANDO': {
      'Pollo vivo': {
        area: 'AVES VIVAS',
        responsable: 'Roberto · Julio Cuadros',
        kpis: [
          { label: 'Unidades movidas', valor: 7850000, unidad: 'aves', promedio: 7620000 },
          { label: 'Viajes', valor: 3420, unidad: 'viajes', promedio: 3310 },
          { label: 'Km recorridos', valor: 612400, unidad: 'km', promedio: 598000 },
          { label: 'Toneladas', valor: 21980, unidad: 't', promedio: 21400 }
        ],
        tendencia: { label: 'Viajes por mes', unidad: 'viajes', valores: [3180, 3240, 3305, 3290, 3410, 3420] },
        bloques: [
          { tipo: 'split', capitulo: 'entregas', pregunta: '¿Cómo realizamos las entregas?', titulo: 'Modalidad de entrega', unidad: '%', partes: [
            { label: 'Distribución', valor: 62 }, { label: 'Recoge (cliente)', valor: 38 } ] },
          { tipo: 'ranking', capitulo: 'canales', pregunta: '¿A qué canales atendemos?', titulo: 'Participación por canal de venta', unidad: '%', partes: [
            { label: 'Distribuidores', valor: 34 }, { label: 'Mayoristas distribución', valor: 27 },
            { label: 'Mayoristas Norte', valor: 22 }, { label: 'Mayoristas Sur', valor: 17 } ] },
          { tipo: 'stats', capitulo: 'resultados', pregunta: '¿Qué resultados obtuvimos?', titulo: 'Venta de pollo', comparaCon: 'Toneladas', items: [
            { label: 'Venta del mes', valor: 22100, unidad: 't' },
            { label: 'Promedio mensual', valor: 21850, unidad: 't' } ] }
        ],
        flota: { unidades: 22, propias: 14, terceros: 8, gps: 22, tipo: 'Camión jaulero (aves)', imagen: '' }
      },
      'Cerdo vivo': {
        responsable: 'Por confirmar',
        kpis: [
          { label: 'Unidades movidas', valor: 98500, unidad: 'cerdos', promedio: 96200 },
          { label: 'Viajes', valor: 610, unidad: 'viajes', promedio: 598 },
          { label: 'Km recorridos', valor: 118300, unidad: 'km', promedio: 114900 },
          { label: 'Toneladas', valor: 10340, unidad: 't', promedio: 10100 }
        ],
        tendencia: { label: 'Viajes por mes', unidad: 'viajes', valores: [570, 588, 602, 596, 605, 610] },
        bloques: [],
        flota: { unidades: 6, propias: 4, terceros: 2, gps: 6, tipo: 'Camión portaganado', imagen: '' }
      },
      'Pavo vivo': {
        responsable: 'Por confirmar',
        kpis: [
          { label: 'Unidades movidas', valor: 182000, unidad: 'pavos', promedio: 121000 },
          { label: 'Viajes', valor: 265, unidad: 'viajes', promedio: 190 },
          { label: 'Km recorridos', valor: 41200, unidad: 'km', promedio: 30500 },
          { label: 'Toneladas', valor: 2150, unidad: 't', promedio: 1460 }
        ],
        tendencia: { label: 'Viajes por mes', unidad: 'viajes', valores: [150, 162, 170, 185, 210, 265] },
        bloques: [],
        flota: { unidades: 5, propias: 3, terceros: 2, gps: 5, tipo: 'Camión jaulero (aves)', imagen: '' }
      },
      'Pollo bebé': {
        area: 'POLLO BB & HI',
        responsable: 'Hilmer Pinedo',
        kpis: [
          { label: 'Unidades movidas', valor: 9120000, unidad: 'pollitos', promedio: 8950000 },
          { label: 'Viajes', valor: 840, unidad: 'viajes', promedio: 822 },
          { label: 'Km recorridos', valor: 96500, unidad: 'km', promedio: 94100 },
          { label: 'Toneladas', valor: 410, unidad: 't', promedio: 402 }
        ],
        tendencia: { label: 'Viajes por mes', unidad: 'viajes', valores: [805, 812, 826, 818, 831, 840] },
        bloques: [
          { tipo: 'split', capitulo: 'entregas', pregunta: '¿A dónde va la producción?', titulo: 'Destino de la producción', unidad: '%', partes: [
            { label: 'Granja propia', valor: 81 }, { label: 'Venta', valor: 19 } ] }
        ],
        flota: { unidades: 7, propias: 7, terceros: 0, gps: 7, tipo: 'Furgón isotérmico', imagen: '' }
      },
      'Huevo incubable': {
        area: 'POLLO BB & HI',
        responsable: 'Hilmer Pinedo',
        kpis: [
          { label: 'Unidades movidas', valor: 10450000, unidad: 'huevos', promedio: 10200000 },
          { label: 'Viajes', valor: 410, unidad: 'viajes', promedio: 402 },
          { label: 'Km recorridos', valor: 52800, unidad: 'km', promedio: 51600 },
          { label: 'Toneladas', valor: 640, unidad: 't', promedio: 626 }
        ],
        tendencia: { label: 'Viajes por mes', unidad: 'viajes', valores: [392, 398, 401, 405, 404, 410] },
        bloques: [
          { tipo: 'split', capitulo: 'entregas', pregunta: '¿A dónde va la producción?', titulo: 'Destino de la producción', unidad: '%', partes: [
            { label: 'Granja propia', valor: 92 }, { label: 'Venta', valor: 8 } ] }
        ],
        flota: { unidades: 4, propias: 4, terceros: 0, gps: 4, tipo: 'Furgón isotérmico', imagen: '' }
      },
      'Alimento balanceado': {
        area: 'ALIMENTO BALANCEADO',
        responsable: 'Gustavo Zegarra',
        kpis: [
          { label: 'Unidades movidas', valor: 1265000, unidad: 'sacos', promedio: 1240000 },
          { label: 'Viajes', valor: 1980, unidad: 'viajes', promedio: 1935 },
          { label: 'Km recorridos', valor: 287000, unidad: 'km', promedio: 281500 },
          { label: 'Toneladas', valor: 58400, unidad: 't', promedio: 57100 }
        ],
        tendencia: { label: 'Viajes por mes', unidad: 'viajes', valores: [1890, 1902, 1944, 1950, 1961, 1980] },
        bloques: [
          { tipo: 'split', capitulo: 'entregas', pregunta: '¿En qué formato despachamos?', titulo: 'Despacho: ensacado vs. tolvas', unidad: 't', partes: [
            { label: 'Granel (tolvas)', valor: 42050 }, { label: 'Ensacado', valor: 16350 } ] },
          { tipo: 'stats', capitulo: 'resultados', pregunta: '¿Cuánto cuesta llevar el alimento a granja?', titulo: 'Traslado planta → granja', items: [
            { label: 'Costo del mes', valor: 1460000, moneda: true },
            { label: 'Promedio mensual', valor: 1425000, moneda: true },
            { label: 'Costo por tonelada', valor: 25, moneda: true } ] }
        ],
        flota: { unidades: 12, propias: 9, terceros: 3, gps: 12, tipo: 'Tolva granelera', imagen: '' }
      },
      'Macroinsumos': {
        area: 'MACRO INSUMOS',
        responsable: 'Por confirmar',
        kpis: [
          { label: 'Unidades movidas', valor: 1480, unidad: 'contenedores', promedio: 1420 },
          { label: 'Viajes', valor: 2210, unidad: 'viajes', promedio: 2150 },
          { label: 'Km recorridos', valor: 74300, unidad: 'km', promedio: 72800 },
          { label: 'Toneladas', valor: 64900, unidad: 't', promedio: 63000 }
        ],
        tendencia: { label: 'Toneladas por mes', unidad: 't', valores: [61200, 60400, 63800, 62900, 64100, 64900] },
        bloques: [
          { tipo: 'split', capitulo: 'entregas', pregunta: '¿Dónde almacenamos?', titulo: 'Destino de almacenamiento', unidad: '%', partes: [
            { label: 'Almacén propio', valor: 72 }, { label: 'Almacén tercero', valor: 28 } ] },
          { tipo: 'stats', capitulo: 'resultados', pregunta: '¿Cuánto nos cuesta la operación?', titulo: 'Costos del mes', items: [
            { label: 'Costo de almacenaje', valor: 385000, moneda: true },
            { label: 'Costo de traslado', valor: 912000, moneda: true } ] }
        ],
        flota: { unidades: 4, propias: 2, terceros: 2, gps: 4, tipo: 'Camión plataforma', imagen: '' }
      },
      'Almacén central': {
        area: 'ALMACEN CENTRAL',
        responsable: 'Por confirmar',
        kpis: [
          { label: 'Unidades movidas', valor: 46800, unidad: 'ítems', promedio: 45100 },
          { label: 'Viajes', valor: 310, unidad: 'viajes', promedio: 302 },
          { label: 'Km recorridos', valor: 21400, unidad: 'km', promedio: 20900 },
          { label: 'Toneladas', valor: 1850, unidad: 't', promedio: 1790 }
        ],
        tendencia: { label: 'Viajes por mes', unidad: 'viajes', valores: [288, 295, 301, 299, 306, 310] },
        bloques: [
          { tipo: 'stats', capitulo: 'resultados', pregunta: '¿Cuánto nos cuesta la operación?', titulo: 'Costos del mes', items: [
            { label: 'Costo de almacenaje', valor: 148000, moneda: true },
            { label: 'Costo de traslado', valor: 96000, moneda: true } ] }
        ],
        flota: { unidades: 2, propias: 2, terceros: 0, gps: 2, tipo: 'Camión furgón', imagen: '' }
      }
    },
    'CHIMU': {
      /* Se completa después de cerrar San Fernando (mismo formato). */
    }
  }
};
