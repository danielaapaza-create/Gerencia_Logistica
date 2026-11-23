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
│   └── negocios-ficha.css      # Estilos de la ficha de indicadores por negocio
├── datos/
│   └── LOGIXSC_Plantilla_Datos.xlsx  # Plantilla de datos editable
├── js/
│   ├── datos.js                # Datos: dashboards Power BI y portafolio de proyectos
│   ├── analitica-proyectos.js  # Analítica (empresas/áreas) e Implementación (filtros)
│   ├── visor-pdf.js            # Modal visor de PDF (Red logística)
│   ├── secciones-colapsables.js# Contraer/expandir secciones
│   ├── interactividad.js       # Barra de progreso, menú activo, animación reveal, volver arriba
│   ├── filtro-eventos.js       # Filtros de la agenda de eventos
│   ├── carrusel-hero.js        # Carrusel automático del inicio (flechas, puntos, teclado, swipe)
│   ├── carrusel-badge.js       # Etiqueta "CARRUSEL AUTOMÁTICO"
│   ├── iconos.js               # Iconos Lucide (locales, sin CDN)
│   ├── negocios-datos.js       # Indicadores por negocio (datos de la ficha)
│   └── negocios-ficha.js       # Ficha de indicadores al hacer clic en un negocio
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
