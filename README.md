# LOGIXSC+ · Gerencia de Logística

Portal interno de la Gerencia de Logística (San Fernando · Chimu).

Este proyecto es la versión organizada del archivo original
`LOGIXSC_plus_V26_HEADER_PROLIJO_2.html`: el mismo HTML, CSS y JavaScript,
separado en archivos y con las imágenes y PDF (antes incrustados en base64)
extraídos a `assets/` sin recomprimir ni modificar.

## Estructura

```
.
├── index.html                  # Estructura de la página (todas las secciones originales)
├── .nojekyll                   # GitHub Pages sirve los archivos tal cual
├── css/
│   ├── styles.css              # Los 9 bloques <style> originales, en el mismo orden
│   ├── negocios-ficha.css      # Estilos de la ficha de indicadores por negocio
│   ├── eventos.css             # Estilos de la agenda logística
│   ├── analitica.css           # Estilos de la sección Analítica
│   └── equipo.css              # Quiénes somos: tarjeta que gira y organigrama
├── datos/
│   ├── LOGIXSC_Datos_Fichas.xlsx          # FUENTE de las fichas de negocio (editar este)
│   ├── LOGIXSC_Solicitud_Datos_Jefatura.xlsx # Formato de reunión: validar/sincerar cifras (no lo lee el portal)
│   └── LOGIXSC_Eventos_Hitos.xlsx         # Recopilar agenda, hitos, aniversarios y bienvenidas
├── herramientas/
│   ├── generar_formato_reunion.py   # Crea el formato de reunión desde Datos_Fichas
│   ├── aplicar_formato_reunion.py   # Pasa los valores sincerados a Datos_Fichas
│   └── excel_a_eventos.py           # Pasa LOGIXSC_Eventos_Hitos.xlsx a js/eventos-datos.js y js/hitos-datos.js
├── js/
│   ├── datos.js                # Datos: dashboards Power BI y portafolio de proyectos
│   ├── analitica-proyectos.js  # Implementación (portafolio de proyectos, sección oculta)
│   ├── analitica.js            # Analítica: KPI y catálogo de dashboards
│   ├── organigramas-datos.js   # Equipos de cada líder (editar aquí)
│   ├── equipo-organigrama.js   # Tarjeta que gira y organigrama completo
│   ├── visor-pdf.js            # Modal visor de PDF (Red logística)
│   ├── secciones-colapsables.js# Contraer/expandir secciones
│   ├── interactividad.js       # Barra de progreso, menú activo, animación reveal, volver arriba
│   ├── carrusel-hero.js        # Carrusel automático del inicio (flechas, puntos, teclado, swipe)
│   ├── carrusel-badge.js       # Etiqueta "CARRUSEL AUTOMÁTICO"
│   ├── iconos.js               # Iconos Lucide (locales, sin CDN)
│   ├── negocios-datos.js       # Respaldo de los datos de las fichas
│   ├── negocios-excel.js       # Lee datos/LOGIXSC_Datos_Fichas.xlsx en el navegador
│   ├── negocios-ficha.js       # Ficha de indicadores al hacer clic en un negocio
│   ├── eventos-datos.js        # Agenda logística: lista de eventos (editar aquí)
│   ├── eventos.js              # Agenda logística: tarjetas, filtros y estados
│   ├── hitos-datos.js          # Hitos del equipo: lista de hitos (editar aquí)
│   └── hitos.js                # Hitos del equipo: destacado, tarjetas y filtro
└── assets/
    ├── docs/
    │   ├── red-logistica-san-fernando.pdf
    │   └── red-logistica-chimu.pdf
    └── img/
        ├── carrusel/   # 7 imágenes del carrusel del inicio
        ├── equipo/     # 4 fotos de "Quiénes somos"
        ├── hero/       # fondo del hero (usado por estilos heredados)
        ├── logos/      # logos San Fernando y Chimu
        ├── negocios/   # 8 imágenes de "Nuestros negocios" (macroinsumos se reutiliza en Red logística)
        └── red/        # fondo del mapa de red (usado por estilos heredados)
```

Los scripts se cargan en `index.html` exactamente en la misma posición y orden
que tenían los bloques `<script>` originales, por lo que el comportamiento es
el mismo.

## Ejecutar en local

El sitio es estático; basta con abrir `index.html`. Para que el visor de PDF
funcione igual que en producción, se recomienda un servidor local:

```bash
python3 -m http.server 8000
```

Luego abrir <http://localhost:8000>.

## Publicar en GitHub Pages

1. Subir el contenido de este repositorio a la rama que se publicará (por ejemplo `main`).
2. En GitHub: **Settings → Pages → Build and deployment**.
3. *Source*: **Deploy from a branch**; *Branch*: `main` y carpeta `/ (root)`.
4. Guardar. La página quedará disponible en
   `https://<usuario>.github.io/<repositorio>/`.

Todas las rutas son relativas, así que funciona tanto en un dominio propio como
en la subruta de GitHub Pages.

## Verificación de fidelidad

La versión separada se comparó contra el HTML original con Chromium (Playwright):

- Capturas por pantalla en escritorio (1440 px, 10 pantallas) y móvil (390 px,
  21 pantallas): idénticas píxel a píxel.
- Estilos computados y posición de los 1 273 elementos de la página: iguales.
- Interacciones probadas con el mismo resultado en ambas versiones: despliegue
  de áreas y filtros/búsqueda de Analítica, filtros de Implementación, filtros
  de Eventos y contador, apertura/cierre del visor PDF (botón × y clic fuera),
  flechas y puntos del carrusel, contraer/expandir secciones, menú activo al
  hacer scroll, botón "volver arriba" y enlaces a Power BI.

## Ficha ejecutiva de indicadores por negocio

En la sección **03 · Nuestros negocios**, cada tarjeta abre una ficha a pantalla
casi completa, organizada como una historia en capítulos (cada uno responde una
pregunta) con navegación lateral (barra superior en móvil):

| Capítulo | Pregunta | Contenido |
|---|---|---|
| Lectura rápida | ¿Qué operación estamos observando? | Resumen en 4 frases, con enlace a cada capítulo |
| La operación | ¿Cómo funciona la operación? | Flujo conceptual Origen → Carga → Transporte → Entrega → Destino, con la cifra medida en cada etapa |
| 01 Volumen | ¿Cuánto movilizamos? | KPI con icono, unidad, comparación con el promedio, micrográfico y definición; evolución mensual con título interpretativo |
| 02 Recursos | ¿Con qué recursos operamos? | Flota en iconos (propias / terceros), cobertura GPS, foto de flota, km por viaje y viajes por unidad (cálculos) |
| 03 Entregas / Distribución | Según el negocio | Barra segmentada con porcentajes y definiciones |
| 04 Canales | ¿A qué canales atendemos? | Ranking de mayor a menor |
| 05 Resultados | ¿Qué resultados obtuvimos? | Venta o costos vs. promedio; aclara que toneladas vendidas ≠ transportadas |
| Atención | ¿Qué información requiere atención? | Alertas generadas por reglas sobre los datos (costos sobre el promedio, unidades sin GPS, datos pendientes) |

Los capítulos sin datos no se muestran. Los volúmenes se comparan en tono
neutro; solo costos (menor es mejor) y ventas (mayor es mejor) se marcan como
*Favorable* o *A vigilar*.

### Cómo actualizar los datos de las fichas

1. Editar `datos/LOGIXSC_Datos_Fichas.xlsx` (celdas amarillas; la hoja LEEME
   explica cada hoja y la columna "Origen" de cada cifra).
2. Subirlo a GitHub con el mismo nombre: carpeta `datos` → **Add file** →
   **Upload files** → **Commit changes**.
3. Esperar 1–2 minutos y recargar el portal con Ctrl + F5.

El portal lee el Excel directamente en el navegador (`js/negocios-excel.js`,
sin librerías externas). Si no puede leerlo —por ejemplo, al abrir
`index.html` con doble clic en vez de un servidor—, usa la copia de respaldo
`js/negocios-datos.js`. Esa copia no se actualiza sola: conviene regenerarla
de vez en cuando a partir del Excel.

### Validar las cifras con jefatura

`datos/LOGIXSC_Solicitud_Datos_Jefatura.xlsx` trae precargadas todas las cifras
que hoy muestra el portal, con su origen (PDF, cálculo o interpretación). En la
reunión se marca el estado de cada una y se escribe el valor sincerado. Después:

```bash
python3 herramientas/aplicar_formato_reunion.py datos/LOGIXSC_Solicitud_Datos_Jefatura.xlsx datos/LOGIXSC_Datos_Fichas.xlsx
```

Para volver a generar el formato a partir del Excel del portal (por ejemplo, en
la siguiente revisión):

```bash
python3 herramientas/generar_formato_reunion.py datos/LOGIXSC_Datos_Fichas.xlsx datos/LOGIXSC_Solicitud_Datos_Jefatura.xlsx
```

**Fuente actual de los datos:** los PDF de red logística (`assets/docs/`):
costos, costo unitario, flota y volumen anual 2024, y los repartos del diagrama
de red (San Fernando: mensual; Chimu: anual). El PDF no trae viajes, km ni GPS:
la ficha los muestra como "dato pendiente". Cerdo vivo y Pavo vivo no figuran
en la red de Chimu.

Archivos: `js/negocios-datos.js` (datos), `js/negocios-ficha.js` (lógica),
`css/negocios-ficha.css` (estilos), `js/iconos.js` (iconos Lucide incluidos
localmente, licencia ISC). Mientras `ejemplo: true`, la ficha muestra el aviso
**DATOS DE EJEMPLO**. Un negocio sin datos para una empresa muestra
"Indicadores en preparación".

## Agenda logística (sección 06 · Eventos)

Los eventos están en `js/eventos-datos.js`, uno por línea (fecha `AAAA-MM-DD`,
hora de inicio y fin, tipo, área, tema, lugar, responsable y si se canceló).
Para agregar uno, copia una línea y cambia los valores. El estado (Próxima, Hoy,
En curso, Finalizada) se calcula solo con la fecha y la hora del navegador, y
las áreas del filtro salen de los propios eventos.

Los filtros (buscador, área, Próximos / Pasados / Todos y "Limpiar filtros")
actualizan las tarjetas al instante. Si no hay resultados, se muestra un mensaje
con la opción de limpiar los filtros.

### Hitos del equipo

Debajo de la agenda, el bloque **Hitos del equipo** es una línea de tiempo
horizontal: de izquierda a derecha en orden cronológico, con marcas de año,
flechas para avanzar y deslizamiento en celular. Al cargar, muestra el hito
más reciente. Los datos están en
`js/hitos-datos.js`. Las categorías son: lanzamiento, aniversario laboral,
bienvenida, hito operativo, reconocimiento, capacitación y actividad del equipo.

- Hitos generales: título, descripción, impacto (cifra y etiqueta), equipo y foto.
- Aniversarios y bienvenidas: persona, cargo, área, años en la empresa, mensaje y
  foto. Sin foto se muestran las iniciales.
- Las fechas futuras muestran "Próximamente"; `confirmar: true` muestra
  "Por confirmar".
- Los filtros solo muestran las categorías que tienen hitos.

### Recopilar eventos e hitos

`datos/LOGIXSC_Eventos_Hitos.xlsx` tiene una hoja por tipo de contenido:
Agenda, Hitos y Aniversarios_Bienvenidas. Cada hoja incluye listas
desplegables, una columna "Control" y cálculos automáticos (años que cumple
cada persona y fecha del aniversario). Una vez lleno:

```bash
python3 herramientas/excel_a_eventos.py datos/LOGIXSC_Eventos_Hitos.xlsx
```

El script reescribe `js/eventos-datos.js` y `js/hitos-datos.js`. Las filas
incompletas y las personas sin autorización no se publican; el script lo
indica como aviso.

## Analítica logística (sección 05)

Los datos siguen en `analyticsData` (`js/datos.js`). La sección se arma sola a
partir de ellos, en tres niveles:

1. **KPI**: dashboards totales, por empresa y áreas con analítica.
2. **Catálogo**: buscador (sin importar tildes), filtros de empresa y área,
   botón Limpiar y tarjetas por empresa con áreas desplegables. Cada dashboard
   muestra responsable, jefatura, fecha de actualización y el botón
   "Abrir en Power BI".

Los filtros conservan los `id` originales (`aSearch`, `aCompany`, `aArea`), que
usa la ficha de negocios para abrir la analítica de un área.

## Organigramas (Quiénes somos)

Las tarjetas con `data-org="clave"` muestran el botón **Ver equipo**: la
tarjeta gira y en el reverso aparece el equipo agrupado por sede. Desde ahí,
**Ver organigrama** lo abre en grande. Los equipos están en
`js/organigramas-datos.js` (fuente: Teams → Organización). Para agregar el
equipo de otro líder, crea su bloque con una clave nueva y pon esa clave en
`data-org` de su tarjeta.

## Caché del navegador

En `index.html`, los CSS y JS se cargan con `?v=AAAAMMDD` (por ejemplo
`css/eventos.css?v=20261127`). Cuando cambies un CSS o JS, actualiza ese número
en todas las líneas. Así el navegador descarga la versión nueva y no usa una
copia vieja guardada.
