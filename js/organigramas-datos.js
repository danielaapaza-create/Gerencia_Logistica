/* Organigramas de los líderes (reverso de las tarjetas de "Quiénes somos").
   Fuente: Microsoft Teams, pestaña Organización ("Personas que informan a…").
   Para agregar el equipo de otro líder: copia el bloque, cambia la clave y
   pon esa misma clave en data-org="..." de su tarjeta en index.html.
   - sede: se usa para agrupar al equipo en el organigrama. */
const organigramas = {
  'edgard-vasquez': {
    lider: { nombre: 'Edgard Vasquez Daza', cargo: 'Jefe de Operaciones Logísticas', area: 'Gerencia de Logística' },
    fuente: 'Microsoft Teams · noviembre 2026',
    equipo: [
      { nombre: 'Miguel Alejandro Burgos Urquiza',   cargo: 'Supervisor de Operaciones Logísticas', sede: 'Almacén Central · Chorrillos' },
      { nombre: 'Jimmy Martin Trinidad Hernandez',   cargo: 'Asistente de Operaciones Logísticas',  sede: 'Almacén Central · Chorrillos' },
      { nombre: 'Edith Génesis Betsabe Lara Muñante', cargo: 'Asistente de Control Administrativo',  sede: 'Almacén Central · Chorrillos' },
      { nombre: 'Cristhian Daniel Ortiz Carrascal',  cargo: 'Asistente de Gestión Documentaria 1',  sede: 'Almacén Central · Chorrillos' },
      { nombre: 'Eddy Raul Rojas Ayquipa',           cargo: 'Asistente de Almacén 3',               sede: 'Almacén Central · Chorrillos' },
      { nombre: 'Ysaac Vera Usaqui',                 cargo: 'Asistente de Almacén 3',               sede: 'Almacén Central · Chorrillos' },
      { nombre: 'Eduardo Rafael Trujillo Coronel',   cargo: 'Supervisor de Operaciones Logísticas', sede: 'Almacén Plantel 1 · Lurín' },
      { nombre: 'German Toscano Gonzales',           cargo: 'Almacenero',                           sede: 'Almacén Sachilsa' },
      { nombre: 'Jesus Alberto Talla Pachas',        cargo: 'Asistente de Almacén',                 sede: 'Cabeza de Toro' }
    ]
  }
};
