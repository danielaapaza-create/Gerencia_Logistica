/* Hitos y visibilidad del equipo (bloque dentro de la sección 06 · Eventos).

   Para agregar un hito, copia un bloque { ... } y cambia sus valores:
   - fecha:       'AAAA-MM-DD' o 'AAAA-MM' (si solo se conoce el mes)
   - categoria:   clave de CATEGORIAS_HITOS (abajo)
   - empresa:     'SAN FERNANDO' | 'CHIMU' | 'AMBAS'
   - area:        negocio o equipo
   - titulo, descripcion
   - impacto:     { valor: '62', etiqueta: 'unidades sinceradas' }, o null
   - equipo:      quiénes lo hicieron posible (texto libre), o null
   - imagen:      ruta de la foto (por ejemplo 'assets/img/hitos/archivo.jpg'), o null
   - destacado:   true para mostrarlo en grande (se usa el más reciente)
   - confirmar:   true mientras la fecha o el texto no estén validados (muestra "Por confirmar")
*/
const CATEGORIAS_HITOS = {
  'operativo':      { nombre: 'Hito operativo',       icono: 'flag' },
  'transformacion': { nombre: 'Transformación',       icono: 'sparkles' },
  'reconocimiento': { nombre: 'Reconocimiento',       icono: 'award' },
  'capacitacion':   { nombre: 'Capacitación',         icono: 'graduation-cap' },
  'equipo':         { nombre: 'Actividad del equipo', icono: 'party-popper' }
};

const hitosEquipo = [
  {
    fecha: '2026-11', categoria: 'transformacion', empresa: 'AMBAS', area: 'Gerencia de Logística',
    titulo: 'Lanzamiento del portal LOGIXSC+',
    descripcion: 'Un solo lugar para consultar los negocios, la red logística, la analítica y la agenda de la gerencia de San Fernando y Chimu.',
    impacto: { valor: '14', etiqueta: 'fichas de negocio con indicadores' },
    equipo: 'Gerencia de Logística', imagen: 'assets/img/carrusel/07-transformacion-digital.jpg',
    destacado: true, confirmar: true
  },
  {
    fecha: null, categoria: 'operativo', empresa: 'SAN FERNANDO', area: 'Alimento balanceado',
    titulo: 'Sinceramiento de la flota de alimento balanceado',
    descripcion: 'Revisión de las unidades asignadas al despacho de alimento a granjas: tractos y tolvas graneleras, propias y de terceros.',
    impacto: { valor: '62', etiqueta: 'unidades sinceradas' },
    equipo: 'Operaciones · Alimento balanceado', imagen: 'assets/img/negocios/alimento-balanceado.jpg',
    destacado: false, confirmar: true
  },
  {
    fecha: '2025-03', categoria: 'operativo', empresa: 'AMBAS', area: 'Red logística',
    titulo: 'Mapeo de las redes logísticas San Fernando y Chimu',
    descripcion: 'Diagrama de la red de punta a punta —puertos, plantas, granjas, clientes y almacén central— con flota, volúmenes y costo de cada eslabón.',
    impacto: { valor: '2', etiqueta: 'redes documentadas' },
    equipo: 'Gerencia de Logística', imagen: 'assets/img/carrusel/05-macroinsumos-puerto.jpg',
    destacado: false, confirmar: true
  }
];
