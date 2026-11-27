/* Agenda logística: datos de los eventos (único lugar donde se registran).

   Para agregar un evento, copia un bloque { ... } y cambia sus valores:
   - fecha:       'AAAA-MM-DD'
   - inicio, fin: 'HH:MM' (24 h). "fin" permite saber si el evento está en curso.
   - tipo:        'Reunión semanal' | 'Reunión de comité' (u otro tipo nuevo)
   - area:        clave de AREAS_EVENTOS (abajo)
   - tema:        para qué es la reunión
   - lugar
   - responsable: nombre, o null si no se conoce (no se muestra)
   - cancelado:   true solo si el evento se canceló

   El estado (Próxima, Hoy, En curso, Finalizada) se calcula solo con la fecha y la hora.

   Nota: el portal original solo indicaba día y mes. Se usa el año 2026,
   el mismo de los demás datos del portal. Confirmar.
*/
const AREAS_EVENTOS = {
  'TODOS':      { nombre: 'Toda la gerencia', icono: 'users' },
  'FACT-PROY':  { nombre: 'Facturación y proyectos', icono: 'list-checks' },
  'MI-AB-BB-HI':{ nombre: 'Macroinsumos, Alimento, Pollo bebé y Huevo incubable', corto: 'Macroinsumos · Alimento · BB · HI', icono: 'package' },
  'AVES-VIVAS': { nombre: 'Aves vivas', icono: 'bird' }
};

const eventosLogistica = [
  { fecha: '2026-08-28', inicio: '09:00', fin: '10:30', tipo: 'Reunión semanal',   area: 'TODOS',       tema: 'Eventos de la semana',   lugar: 'Cerdito · piso 7',  responsable: null, cancelado: false },
  { fecha: '2026-09-01', inicio: '09:00', fin: '11:00', tipo: 'Reunión de comité', area: 'FACT-PROY',   tema: 'Indicadores y avances',  lugar: 'Almacén central',   responsable: null, cancelado: false },
  { fecha: '2026-09-04', inicio: '09:00', fin: '10:30', tipo: 'Reunión semanal',   area: 'TODOS',       tema: 'Eventos de la semana',   lugar: 'Cerdito · piso 7',  responsable: null, cancelado: false },
  { fecha: '2026-09-08', inicio: '09:00', fin: '11:00', tipo: 'Reunión de comité', area: 'MI-AB-BB-HI', tema: 'Indicadores y avances',  lugar: 'Almacén central',   responsable: null, cancelado: false },
  { fecha: '2026-09-08', inicio: '15:00', fin: '17:00', tipo: 'Reunión de comité', area: 'AVES-VIVAS',  tema: 'Indicadores y avances',  lugar: 'Almacén central',   responsable: null, cancelado: false }
];
