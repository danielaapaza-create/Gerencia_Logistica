/* ============================================================================
   RESPALDO. La fuente principal es datos/LOGIXSC_Datos_Fichas.xlsx: el portal
   lo lee al cargar y solo usa este archivo si no puede leer el Excel.
   ----------------------------------------------------------------------------
   LOGIXSC+ · Indicadores por negocio (ficha de "Nuestros negocios")
   ----------------------------------------------------------------------------
   FUENTE: PDF de la red logística de cada empresa (assets/docs/):
     - Costos, costo unitario, flota y volumen anual: "Volúmenes Año 2024".
     - Repartos (%, destinos, orígenes): diagrama de red (San Fernando: mensual;
       Chimu: anual). Las sumas se calcularon a partir de las cifras del diagrama.
   El PDF no incluye viajes, km ni GPS: se muestran como pendientes.
   Estructura:
     kpis[]      {titulo, valor, unidad, nota, icono, def}
     flota       {unidades, composicion[{label, valor}], tipo, detalle, imagen}
     bloques[]   split (composición) · ranking (destinos) · stats (costos)
     flujo[]     etapas reales del negocio según el diagrama {icono, nombre, desc, dato}
     pendientes[] datos que faltan o deben confirmarse
     noAplica    el negocio no figura en la red de esa empresa
   "ejemplo: true" vuelve a mostrar el aviso DATOS DE EJEMPLO.
   ========================================================================== */
const negociosIndicadores = {
  "ejemplo": false,
  "periodo": "Año 2024",
  "fuentes": {
    "SAN FERNANDO": "PDF \"Red Logística San Fernando\" · costos y volúmenes 2024 + diagrama de volúmenes mensuales",
    "CHIMU": "PDF \"Red Logística Chimu\" · costos y volúmenes 2024 + diagrama de volúmenes anuales"
  },
  "meses": [],
  "empresas": {
    "SAN FERNANDO": {
      "Pollo vivo": {
        "area": "AVES VIVAS",
        "responsable": "Por confirmar",
        "kpis": [
          {
            "label": "Pollos movilizados",
            "titulo": "Pollos movilizados",
            "valor": 105000000,
            "unidad": "pollos",
            "nota": "Año 2024 (PDF).",
            "icono": "bird",
            "def": "Pollos vivos transportados de las granjas de engorde a clientes y plantas de beneficio durante 2024."
          },
          {
            "label": "Pollos por mes",
            "titulo": "Pollos por mes",
            "valor": 9071000,
            "unidad": "pollos",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "calendar",
            "def": "Suma de los flujos mensuales del diagrama: granjas de engorde → clientes y plantas de beneficio."
          }
        ],
        "flujo": [
          {
            "icono": "warehouse",
            "nombre": "Granjas de engorde",
            "desc": "Granjas Norte, Centro y Sur donde se cría el pollo.",
            "dato": "Norte 77% · Centro 12% · Sur 12%"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Flota tercera de semitrailers y camiones.",
            "dato": "69 unidades"
          },
          {
            "icono": "store",
            "nombre": "Clientes",
            "desc": "Venta de pollo vivo a clientes de Lima, Sur y Provincia.",
            "dato": "65% del volumen"
          },
          {
            "icono": "factory",
            "nombre": "Plantas de beneficio",
            "desc": "Centros de beneficio avícola (CBA) Huaral y Chincha.",
            "dato": "35% del volumen"
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿A dónde va el pollo vivo?",
            "titulo": "Venta a clientes vs. plantas de beneficio",
            "unidad": "pollos",
            "partes": [
              {
                "label": "Clientes (venta)",
                "valor": 5920000
              },
              {
                "label": "Plantas de beneficio (CBA)",
                "valor": 3151000
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Desde qué granjas sale?",
            "titulo": "Origen por zona de engorde",
            "unidad": "pollos",
            "partes": [
              {
                "label": "Granjas de engorde Norte",
                "valor": 6947000
              },
              {
                "label": "Granjas de engorde Centro",
                "valor": 1051000
              },
              {
                "label": "Granjas de engorde Sur",
                "valor": 1073000
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "ranking",
            "capitulo": "canales",
            "pregunta": "¿A qué destinos atendemos?",
            "titulo": "Destinos del pollo vivo",
            "unidad": "pollos",
            "sustantivo": "destino",
            "partes": [
              {
                "label": "Clientes Lima",
                "valor": 4457000
              },
              {
                "label": "CBA Huaral",
                "valor": 3059000
              },
              {
                "label": "Clientes Sur",
                "valor": 1032000
              },
              {
                "label": "Clientes Provincia",
                "valor": 431000
              },
              {
                "label": "CBA Chincha",
                "valor": 92000
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 21300000,
                "moneda": true
              },
              {
                "label": "Costo por pollo",
                "valor": 0.2,
                "moneda": true,
                "decimales": 2
              },
              {
                "label": "Costo por kg",
                "valor": 0.07,
                "moneda": true,
                "decimales": 2
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 17,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 69,
          "composicion": [
            {
              "label": "Flota tercera (FT)",
              "valor": 69
            }
          ],
          "tipo": "Semitrailer y camión",
          "detalle": "58 semitrailers y 11 camiones · flota tercera",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF."
        ]
      },
      "Cerdo vivo": {
        "responsable": "Por confirmar",
        "kpis": [
          {
            "label": "Cerdos al camal",
            "titulo": "Cerdos al camal",
            "valor": 7020,
            "unidad": "cerdos",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "paw-print",
            "def": "Cerdos trasladados al Camal Chorrillos en un mes, desde granjas de engorde y reproductoras."
          },
          {
            "label": "Toneladas al camal",
            "titulo": "Toneladas al camal",
            "valor": 418,
            "unidad": "t",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "weight",
            "def": "Peso de los cerdos trasladados al camal en un mes."
          },
          {
            "label": "Alimento recibido",
            "titulo": "Alimento recibido",
            "valor": 1055,
            "unidad": "t",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "package",
            "def": "Alimento balanceado enviado a granjas de cerdo en un mes."
          }
        ],
        "flujo": [
          {
            "icono": "warehouse",
            "nombre": "Granjas reproductoras",
            "desc": "GR Cerdos.",
            "dato": "70 cerdos a engorde"
          },
          {
            "icono": "warehouse",
            "nombre": "Granjas de engorde",
            "desc": "Granjas de engorde de cerdo.",
            "dato": "903 t de alimento/mes"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Traslado de cerdos vivos.",
            "dato": ""
          },
          {
            "icono": "factory",
            "nombre": "Camal Chorrillos",
            "desc": "Destino de los cerdos para beneficio.",
            "dato": "7,020 cerdos/mes"
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿De dónde llegan los cerdos al camal?",
            "titulo": "Origen de los cerdos trasladados al camal",
            "unidad": "cerdos",
            "partes": [
              {
                "label": "Granjas de engorde",
                "valor": 6100
              },
              {
                "label": "Granjas reproductoras",
                "valor": 920
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          }
        ],
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF.",
          "Flota y costo logístico del negocio: no figuran en el PDF."
        ]
      },
      "Pavo vivo": {
        "responsable": "Por confirmar",
        "kpis": [
          {
            "label": "Pavos a beneficio",
            "titulo": "Pavos a beneficio",
            "valor": 148000,
            "unidad": "pavos",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "bird",
            "def": "Pavos trasladados de granjas de engorde a planta de beneficio en un mes."
          },
          {
            "label": "Toneladas a beneficio",
            "titulo": "Toneladas a beneficio",
            "valor": 1542,
            "unidad": "t",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "weight",
            "def": "Peso de los pavos trasladados a beneficio en un mes."
          },
          {
            "label": "Pavitos (pavo bb)",
            "titulo": "Pavitos (pavo bb)",
            "valor": 276000,
            "unidad": "pavitos",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "bird",
            "def": "Pavitos que salen de la planta de incubación Chorrillos en un mes."
          },
          {
            "label": "Alimento recibido",
            "titulo": "Alimento recibido",
            "valor": 3406,
            "unidad": "t",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "package",
            "def": "Alimento balanceado enviado a granjas de pavo en un mes."
          }
        ],
        "flujo": [
          {
            "icono": "map-pin",
            "nombre": "Importación",
            "desc": "Ingreso de pavos reproductores.",
            "dato": "37K pavos reproductores"
          },
          {
            "icono": "warehouse",
            "nombre": "GR Pavo Cañete",
            "desc": "Granja reproductora de pavo.",
            "dato": "4.5M huevos · 315 t"
          },
          {
            "icono": "factory",
            "nombre": "PI Chorrillos",
            "desc": "Planta de incubación de pavo.",
            "dato": "276K pavitos"
          },
          {
            "icono": "warehouse",
            "nombre": "Granjas de engorde",
            "desc": "Crianza del pavo.",
            "dato": "169K pavitos"
          },
          {
            "icono": "flag",
            "nombre": "Planta de beneficio",
            "desc": "Destino del pavo vivo.",
            "dato": "148K pavos · 1,542 t"
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿A dónde van los pavitos?",
            "titulo": "Pavitos a granja propia vs. venta",
            "unidad": "pavitos",
            "partes": [
              {
                "label": "Granja propia",
                "valor": 169000
              },
              {
                "label": "Venta",
                "valor": 107000
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          }
        ],
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF.",
          "Flota y costo logístico del negocio: no figuran en el PDF."
        ]
      },
      "Pollo bebé": {
        "area": "POLLO BB & HI",
        "responsable": "Hilmer Pinedo",
        "kpis": [
          {
            "label": "Pollitos movilizados",
            "titulo": "Pollitos movilizados",
            "valor": 163000000,
            "unidad": "pollitos",
            "nota": "Año 2024 (PDF).",
            "icono": "bird",
            "def": "Pollitos bebé transportados de las plantas de incubación a las granjas durante 2024."
          },
          {
            "label": "Pollitos por mes",
            "titulo": "Pollitos por mes",
            "valor": 13745000,
            "unidad": "pollitos",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "calendar",
            "def": "Suma de los flujos mensuales del diagrama: plantas de incubación → granjas de engorde y venta."
          }
        ],
        "flujo": [
          {
            "icono": "factory",
            "nombre": "Plantas de incubación",
            "desc": "P.I Norte, P.I Tercera y P.I Sur.",
            "dato": "36% · 35% · 29%"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Flota en renting.",
            "dato": "22 unidades"
          },
          {
            "icono": "warehouse",
            "nombre": "Granjas de engorde",
            "desc": "Zonas Norte, Centro y Sur.",
            "dato": "98.8% del volumen"
          },
          {
            "icono": "store",
            "nombre": "Venta",
            "desc": "Venta de pollo bebé.",
            "dato": "1.2% del volumen"
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿A dónde va la producción?",
            "titulo": "Pollitos a granja propia vs. venta",
            "unidad": "pollitos",
            "partes": [
              {
                "label": "Granja propia",
                "valor": 13577000
              },
              {
                "label": "Venta",
                "valor": 168000
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Desde qué planta sale?",
            "titulo": "Participación por planta de incubación",
            "unidad": "%",
            "partes": [
              {
                "label": "P.I Norte",
                "valor": 36
              },
              {
                "label": "P.I Tercera",
                "valor": 35
              },
              {
                "label": "P.I Sur",
                "valor": 29
              }
            ],
            "nota": "Porcentajes del PDF."
          },
          {
            "tipo": "ranking",
            "capitulo": "canales",
            "pregunta": "¿A qué zonas atendemos?",
            "titulo": "Pollitos por zona de engorde",
            "unidad": "pollitos",
            "sustantivo": "zona",
            "partes": [
              {
                "label": "Zona Norte",
                "valor": 9900000
              },
              {
                "label": "Zona Sur",
                "valor": 3530000
              },
              {
                "label": "Zona Centro",
                "valor": 147000
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 6700000,
                "moneda": true
              },
              {
                "label": "Costo por pollito",
                "valor": 0.042,
                "moneda": true,
                "decimales": 3
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 6,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 22,
          "composicion": [
            {
              "label": "Renting",
              "valor": 22
            }
          ],
          "tipo": "Furgón",
          "detalle": "22 unidades en renting",
          "imagen": "assets/img/flota/sf-pollo-bebe.jpg"
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF."
        ]
      },
      "Huevo incubable": {
        "area": "POLLO BB & HI",
        "responsable": "Hilmer Pinedo",
        "kpis": [
          {
            "label": "Huevos incubables movilizados",
            "titulo": "Huevos incubables movilizados",
            "valor": 383000000,
            "unidad": "huevos",
            "nota": "Año 2024 (PDF).",
            "icono": "egg",
            "def": "Huevos incubables transportados de las granjas reproductoras a las plantas de incubación durante 2024."
          },
          {
            "label": "Huevos por mes",
            "titulo": "Huevos por mes",
            "valor": 21563000,
            "unidad": "huevos",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "calendar",
            "def": "Suma de los flujos mensuales del diagrama: granjas reproductoras → plantas de incubación."
          }
        ],
        "flujo": [
          {
            "icono": "warehouse",
            "nombre": "Granjas reproductoras",
            "desc": "GR Norte y GR Sur.",
            "dato": "60% · 40%"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Flota tercera.",
            "dato": "17 unidades"
          },
          {
            "icono": "factory",
            "nombre": "Plantas de incubación",
            "desc": "P.I Norte y P.I Sur.",
            "dato": "51% · 49%"
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Desde qué granja sale?",
            "titulo": "Participación por granja reproductora",
            "unidad": "%",
            "partes": [
              {
                "label": "GR Norte",
                "valor": 60
              },
              {
                "label": "GR Sur",
                "valor": 40
              }
            ],
            "nota": "Porcentajes del PDF."
          },
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿A qué planta de incubación va?",
            "titulo": "Huevos por planta de destino",
            "unidad": "huevos",
            "partes": [
              {
                "label": "P.I Norte",
                "valor": 10963000
              },
              {
                "label": "P.I Sur",
                "valor": 10600000
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 4200000,
                "moneda": true
              },
              {
                "label": "Costo por huevo incubable",
                "valor": 0.011,
                "moneda": true,
                "decimales": 3
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 3,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 17,
          "composicion": [
            {
              "label": "Flota tercera (FT)",
              "valor": 17
            }
          ],
          "tipo": "Camión",
          "detalle": "17 unidades · flota tercera",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF."
        ]
      },
      "Alimento balanceado": {
        "area": "ALIMENTO BALANCEADO",
        "responsable": "Gustavo Zegarra",
        "kpis": [
          {
            "label": "Toneladas transportadas",
            "titulo": "Toneladas transportadas",
            "valor": 872000,
            "unidad": "t",
            "nota": "Año 2024 (PDF).",
            "icono": "weight",
            "def": "Alimento balanceado transportado desde las plantas de alimento durante 2024."
          },
          {
            "label": "Toneladas por mes",
            "titulo": "Toneladas por mes",
            "valor": 71534,
            "unidad": "t",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "calendar",
            "def": "Suma de los flujos mensuales del diagrama: plantas de alimento → granjas y venta."
          }
        ],
        "flujo": [
          {
            "icono": "map-pin",
            "nombre": "Puertos y almacén",
            "desc": "Llegan los macroinsumos.",
            "dato": ""
          },
          {
            "icono": "factory",
            "nombre": "Plantas de alimento",
            "desc": "Plantas Chancay y Lurín.",
            "dato": "59% · 41%"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Tractos con tolva granelera.",
            "dato": "62 unidades"
          },
          {
            "icono": "warehouse",
            "nombre": "Granjas",
            "desc": "Pollo, pavo, cerdo y ponedora.",
            "dato": "98.9% del volumen"
          },
          {
            "icono": "store",
            "nombre": "Venta de alimento",
            "desc": "Venta AABB a terceros.",
            "dato": "1.1% del volumen"
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Desde qué planta despachamos?",
            "titulo": "Participación por planta de alimento",
            "unidad": "%",
            "partes": [
              {
                "label": "Planta Chancay",
                "valor": 59
              },
              {
                "label": "Planta Lurín",
                "valor": 41
              }
            ],
            "nota": "Porcentajes del PDF."
          },
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Granja o venta?",
            "titulo": "Alimento a granjas propias vs. venta",
            "unidad": "t",
            "partes": [
              {
                "label": "Granjas propias",
                "valor": 70764
              },
              {
                "label": "Venta",
                "valor": 770
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "ranking",
            "capitulo": "canales",
            "pregunta": "¿A dónde va el alimento?",
            "titulo": "Destinos del alimento balanceado",
            "unidad": "t",
            "sustantivo": "destino",
            "partes": [
              {
                "label": "Pollo · zona Norte",
                "valor": 46301
              },
              {
                "label": "Pollo · zona Sur",
                "valor": 17533
              },
              {
                "label": "Pavo · granjas de engorde",
                "valor": 3023
              },
              {
                "label": "Granja ponedora",
                "valor": 1951
              },
              {
                "label": "Cerdo · granjas de engorde",
                "valor": 903
              },
              {
                "label": "Venta de alimento (AABB)",
                "valor": 770
              },
              {
                "label": "Pollo · zona Centro",
                "valor": 518
              },
              {
                "label": "Pavo · granjas reproductoras",
                "valor": 383
              },
              {
                "label": "Cerdo · granjas reproductoras",
                "valor": 152
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 32500000,
                "moneda": true
              },
              {
                "label": "Costo por tonelada",
                "valor": 37.28,
                "moneda": true,
                "decimales": 2
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 27,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 62,
          "composicion": [
            {
              "label": "Flota propia (FP)",
              "valor": 39
            },
            {
              "label": "Flota tercera (FT)",
              "valor": 23
            }
          ],
          "tipo": "Tracto + tolva granelera",
          "detalle": "62 unidades: tractos de flota tercera; tolvas 39 propias y 23 terceras",
          "imagen": "assets/img/flota/sf-alimento-balanceado.jpg"
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF.",
          "Confirmar si la composición propia / tercera (39 / 23) corresponde a las tolvas y los tractos son todos de terceros."
        ]
      },
      "Macroinsumos": {
        "area": "MACRO INSUMOS",
        "responsable": "Por confirmar",
        "kpis": [
          {
            "label": "Toneladas transportadas",
            "titulo": "Toneladas transportadas",
            "valor": 1000000,
            "unidad": "t",
            "nota": "Año 2024 (PDF).",
            "icono": "weight",
            "def": "Macroinsumos transportados de puertos y proveedores a plantas de alimento durante 2024."
          },
          {
            "label": "Toneladas por mes",
            "titulo": "Toneladas por mes",
            "valor": 64158,
            "unidad": "t",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "calendar",
            "def": "Suma de los ingresos mensuales del diagrama: Puerto Callao y proveedor local."
          }
        ],
        "flujo": [
          {
            "icono": "map-pin",
            "nombre": "Puerto Callao / proveedor local",
            "desc": "Ingreso de macroinsumos.",
            "dato": "95% · 5%"
          },
          {
            "icono": "warehouse",
            "nombre": "Almacén tercero",
            "desc": "Parte del volumen se almacena antes de ir a planta.",
            "dato": "17% del volumen"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Flota tercera.",
            "dato": "150 unidades"
          },
          {
            "icono": "factory",
            "nombre": "Plantas de alimento",
            "desc": "Plantas Chancay y Lurín.",
            "dato": "59% · 41%"
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Por dónde ingresa?",
            "titulo": "Origen de los macroinsumos",
            "unidad": "t",
            "partes": [
              {
                "label": "Puerto Callao",
                "valor": 61094
              },
              {
                "label": "Proveedor local",
                "valor": 3064
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Pasa por almacén tercero?",
            "titulo": "Directo a planta vs. almacén tercero",
            "unidad": "t",
            "partes": [
              {
                "label": "Directo a planta",
                "valor": 53292
              },
              {
                "label": "Almacén tercero",
                "valor": 10866
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿A qué planta va?",
            "titulo": "Participación por planta de alimento",
            "unidad": "%",
            "partes": [
              {
                "label": "Planta Chancay",
                "valor": 59
              },
              {
                "label": "Planta Lurín",
                "valor": 41
              }
            ],
            "nota": "Porcentajes del PDF."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 22100000,
                "moneda": true
              },
              {
                "label": "Costo por tonelada",
                "valor": 21.05,
                "moneda": true,
                "decimales": 2
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 18,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 150,
          "composicion": [
            {
              "label": "Flota tercera (FT)",
              "valor": 150
            }
          ],
          "tipo": "Volquete / granelero",
          "detalle": "150 unidades · flota tercera",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF."
        ]
      },
      "Almacén central": {
        "area": "ALMACEN CENTRAL",
        "responsable": "Por confirmar",
        "kpis": [
          {
            "label": "Toneladas despachadas",
            "titulo": "Toneladas despachadas",
            "valor": 4565,
            "unidad": "t",
            "nota": "Año 2024 · calculado: S/ 819K ÷ S/ 179.4 por t",
            "icono": "weight",
            "def": "Materiales e insumos despachados desde el almacén central durante 2024."
          },
          {
            "label": "Toneladas por mes",
            "titulo": "Toneladas por mes",
            "valor": 404.6,
            "unidad": "t",
            "nota": "Volumen mensual del diagrama de red (PDF).",
            "icono": "calendar",
            "def": "Suma de los despachos mensuales por destino del diagrama."
          }
        ],
        "flujo": [
          {
            "icono": "warehouse",
            "nombre": "Almacén central",
            "desc": "Recepción y almacenamiento de materiales e insumos.",
            "dato": ""
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Flota tercera.",
            "dato": "7 unidades"
          },
          {
            "icono": "flag",
            "nombre": "Destinos",
            "desc": "Granjas, plantas, almacenes y CDs.",
            "dato": "18 destinos"
          }
        ],
        "bloques": [
          {
            "tipo": "ranking",
            "capitulo": "canales",
            "pregunta": "¿A qué destinos atendemos?",
            "titulo": "Despachos por destino",
            "unidad": "t",
            "sustantivo": "destino",
            "partes": [
              {
                "label": "Granjas reproductoras Norte",
                "valor": 80
              },
              {
                "label": "Granjas reproductoras Sur",
                "valor": 68
              },
              {
                "label": "Granjas de engorde Sur",
                "valor": 55
              },
              {
                "label": "Planta beneficio Huaral",
                "valor": 34
              },
              {
                "label": "Planta beneficio Chincha",
                "valor": 30
              },
              {
                "label": "Almacenes y CDs",
                "valor": 24
              },
              {
                "label": "Granjas de engorde Norte",
                "valor": 23
              },
              {
                "label": "Granjas de engorde pavo",
                "valor": 17.7
              },
              {
                "label": "Granja ponedora",
                "valor": 17.1
              },
              {
                "label": "Planta procesados",
                "valor": 15
              },
              {
                "label": "Granjas reproductoras pavo",
                "valor": 9.7
              },
              {
                "label": "Planta incubación Norte",
                "valor": 6.2
              },
              {
                "label": "Planta alimento Lurín",
                "valor": 6.1
              },
              {
                "label": "Planta incubación Sur",
                "valor": 5.3
              },
              {
                "label": "Planta incubación Centro",
                "valor": 5.3
              },
              {
                "label": "Granjas de engorde cerdo",
                "valor": 3.6
              },
              {
                "label": "Planta alimento Chancay",
                "valor": 3
              },
              {
                "label": "Planta incubación pavo",
                "valor": 1.6
              }
            ],
            "nota": "Volumen mensual del diagrama de red."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 819000,
                "moneda": true
              },
              {
                "label": "Costo por tonelada",
                "valor": 179.4,
                "moneda": true,
                "decimales": 1
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 1,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 7,
          "composicion": [
            {
              "label": "Flota tercera (FT)",
              "valor": 7
            }
          ],
          "tipo": "Camión",
          "detalle": "7 unidades · flota tercera",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF.",
          "El PDF indica \"Toneladas: 4.5M\", pero S/ 819K ÷ S/ 179.4 por t da ≈4.6 mil t. Se muestra el valor calculado: confirmar."
        ]
      }
    },
    "CHIMU": {
      "Pollo vivo": {
        "area": "AVES VIVAS",
        "responsable": "José Obregoso / Clevex",
        "kpis": [
          {
            "label": "Pollos movilizados",
            "titulo": "Pollos movilizados",
            "valor": 32500000,
            "unidad": "pollos",
            "nota": "Año 2024 (PDF).",
            "icono": "bird",
            "def": "Pollos vivos transportados de las ruedas (granjas de engorde) a clientes y planta de beneficio durante 2024."
          }
        ],
        "flujo": [
          {
            "icono": "warehouse",
            "nombre": "Ruedas de engorde",
            "desc": "Rueda Norte, Centro y Sur.",
            "dato": "33% · 44% · 23%"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Flota tercera.",
            "dato": "51 unidades"
          },
          {
            "icono": "store",
            "nombre": "Clientes",
            "desc": "Venta de pollo vivo.",
            "dato": "76% del volumen"
          },
          {
            "icono": "factory",
            "nombre": "CBA Trujillo",
            "desc": "Centro de beneficio avícola.",
            "dato": "24% del volumen"
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿A dónde va el pollo vivo?",
            "titulo": "Venta a clientes vs. planta de beneficio",
            "unidad": "pollos",
            "partes": [
              {
                "label": "Clientes (venta)",
                "valor": 24400000
              },
              {
                "label": "Plantas de beneficio (CBA)",
                "valor": 7749000
              }
            ],
            "nota": "Volumen anual del diagrama de red (PDF)."
          },
          {
            "tipo": "ranking",
            "capitulo": "canales",
            "pregunta": "¿Desde qué ruedas sale?",
            "titulo": "Pollos por rueda de engorde",
            "unidad": "pollos",
            "sustantivo": "origen",
            "partes": [
              {
                "label": "Rueda Centro",
                "valor": 14100000
              },
              {
                "label": "Rueda Norte",
                "valor": 10749000
              },
              {
                "label": "Rueda Sur",
                "valor": 7300000
              }
            ],
            "nota": "Volumen anual del diagrama de red (PDF)."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 19200000,
                "moneda": true
              },
              {
                "label": "Costo por pollo",
                "valor": 0.59,
                "moneda": true,
                "decimales": 2
              },
              {
                "label": "Costo por kg",
                "valor": 0.23,
                "moneda": true,
                "decimales": 2
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 47,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 51,
          "composicion": [
            {
              "label": "Flota tercera (FT)",
              "valor": 51
            }
          ],
          "tipo": "Camión, semitrailer y trailer",
          "detalle": "33 camiones, 11 semitrailers y 7 trailers · flota tercera",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF."
        ]
      },
      "Pollo bebé": {
        "area": "POLLO BB & HI",
        "responsable": "José Obregoso / Clevex",
        "kpis": [
          {
            "label": "Pollitos movilizados",
            "titulo": "Pollitos movilizados",
            "valor": 62000000,
            "unidad": "pollitos",
            "nota": "Año 2024 (PDF).",
            "icono": "bird",
            "def": "Pollitos bebé transportados de las plantas de incubación a las ruedas durante 2024."
          }
        ],
        "flujo": [
          {
            "icono": "factory",
            "nombre": "Plantas de incubación",
            "desc": "PI Trujillo y PI Chiclayo.",
            "dato": "98% · 2%"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Renting y flota propia.",
            "dato": "6 unidades"
          },
          {
            "icono": "warehouse",
            "nombre": "Ruedas de engorde",
            "desc": "Rueda Norte, Sur y Centro.",
            "dato": ""
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Desde qué planta sale?",
            "titulo": "Participación por planta de incubación",
            "unidad": "pollitos",
            "partes": [
              {
                "label": "PI Trujillo",
                "valor": 61300000
              },
              {
                "label": "PI Chiclayo",
                "valor": 976000
              }
            ],
            "nota": "Volumen anual del diagrama de red (PDF)."
          },
          {
            "tipo": "ranking",
            "capitulo": "canales",
            "pregunta": "¿A qué ruedas atendemos?",
            "titulo": "Pollitos por rueda de destino",
            "unidad": "pollitos",
            "sustantivo": "rueda",
            "partes": [
              {
                "label": "Rueda Norte",
                "valor": 26376000
              },
              {
                "label": "Rueda Sur",
                "valor": 19000000
              },
              {
                "label": "Rueda Centro",
                "valor": 16900000
              }
            ],
            "nota": "Volumen anual del diagrama de red (PDF)."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 2100000,
                "moneda": true
              },
              {
                "label": "Costo por pollito",
                "valor": 0.034,
                "moneda": true,
                "decimales": 3
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 5,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 6,
          "composicion": [
            {
              "label": "Flota propia (FP)",
              "valor": 3
            },
            {
              "label": "Renting",
              "valor": 3
            }
          ],
          "tipo": "Furgón",
          "detalle": "6 unidades: 3 propias y 3 en renting",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF."
        ]
      },
      "Huevo incubable": {
        "area": "POLLO BB & HI",
        "responsable": "José Obregoso / Clevex",
        "kpis": [
          {
            "label": "Huevos incubables movilizados",
            "titulo": "Huevos incubables movilizados",
            "valor": 78000000,
            "unidad": "huevos",
            "nota": "Año 2024 (PDF).",
            "icono": "egg",
            "def": "Huevos incubables transportados de las granjas reproductoras a las plantas de incubación durante 2024."
          }
        ],
        "flujo": [
          {
            "icono": "warehouse",
            "nombre": "Granjas reproductoras",
            "desc": "GR Sausal y GR Mocan.",
            "dato": "91% · 9%"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Flota tercera.",
            "dato": "3 unidades"
          },
          {
            "icono": "factory",
            "nombre": "Plantas de incubación",
            "desc": "PI Trujillo y PI Chiclayo.",
            "dato": ""
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Desde qué granja sale?",
            "titulo": "Participación por granja reproductora",
            "unidad": "huevos",
            "partes": [
              {
                "label": "GR Sausal",
                "valor": 71100000
              },
              {
                "label": "GR Mocan",
                "valor": 6785000
              }
            ],
            "nota": "Volumen anual del diagrama de red (PDF)."
          },
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿A qué planta de incubación va?",
            "titulo": "Huevos por planta de destino",
            "unidad": "huevos",
            "partes": [
              {
                "label": "PI Trujillo",
                "valor": 77100000
              },
              {
                "label": "PI Chiclayo",
                "valor": 785000
              }
            ],
            "nota": "Volumen anual del diagrama de red (PDF)."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 611000,
                "moneda": true
              },
              {
                "label": "Costo por huevo incubable",
                "valor": 0.008,
                "moneda": true,
                "decimales": 3
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 2,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 3,
          "composicion": [
            {
              "label": "Flota tercera (FT)",
              "valor": 3
            }
          ],
          "tipo": "Camión",
          "detalle": "3 unidades · flota tercera",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF."
        ]
      },
      "Alimento balanceado": {
        "area": "ALIMENTO BALANCEADO",
        "responsable": "José Obregoso / Clevex",
        "kpis": [
          {
            "label": "Toneladas transportadas",
            "titulo": "Toneladas transportadas",
            "valor": 268000,
            "unidad": "t",
            "nota": "Año 2024 (PDF).",
            "icono": "weight",
            "def": "Alimento balanceado transportado desde los molinos durante 2024."
          }
        ],
        "flujo": [
          {
            "icono": "map-pin",
            "nombre": "Puertos y almacén tercero",
            "desc": "Paita y Salaverry.",
            "dato": ""
          },
          {
            "icono": "factory",
            "nombre": "Molinos",
            "desc": "Milagro, Trujillo y Sullana.",
            "dato": "19% · 49% · 32%"
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Camiones y semitrailers.",
            "dato": "30 unidades"
          },
          {
            "icono": "warehouse",
            "nombre": "Granjas",
            "desc": "Ruedas de engorde y granjas reproductoras.",
            "dato": "6 destinos"
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Desde qué molino despachamos?",
            "titulo": "Participación por molino",
            "unidad": "%",
            "partes": [
              {
                "label": "Molino Trujillo",
                "valor": 49
              },
              {
                "label": "Molino Sullana",
                "valor": 32
              },
              {
                "label": "Molino Milagro",
                "valor": 19
              }
            ],
            "nota": "Porcentajes del PDF."
          },
          {
            "tipo": "ranking",
            "capitulo": "canales",
            "pregunta": "¿A dónde va el alimento?",
            "titulo": "Destinos del alimento balanceado",
            "unidad": "t",
            "sustantivo": "destino",
            "partes": [
              {
                "label": "Rueda Sur",
                "valor": 117000
              },
              {
                "label": "Rueda Centro",
                "valor": 78000
              },
              {
                "label": "Rueda Norte",
                "valor": 46000
              },
              {
                "label": "GR Sausal",
                "valor": 18000
              },
              {
                "label": "GR Levante Facala",
                "valor": 4900
              },
              {
                "label": "GR Mocan",
                "valor": 1900
              }
            ],
            "nota": "Volumen anual del diagrama de red (PDF)."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 13200000,
                "moneda": true
              },
              {
                "label": "Costo por tonelada",
                "valor": 49.31,
                "moneda": true,
                "decimales": 2
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 32,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 30,
          "composicion": [
            {
              "label": "Semitrailer · flota propia (FP)",
              "valor": 23
            },
            {
              "label": "Semitrailer · flota tercera (FT)",
              "valor": 4
            },
            {
              "label": "Camión",
              "valor": 3
            }
          ],
          "tipo": "Tracto + semitrailer",
          "detalle": "3 camiones y 27 semitrailers (23 propios, 4 terceros); 27 tractos de flota tercera",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF.",
          "Confirmar la composición de la flota de alimento (camiones, tractos y semitrailers)."
        ]
      },
      "Macroinsumos": {
        "area": "MACRO INSUMOS",
        "responsable": "José Obregoso / Clevex",
        "kpis": [
          {
            "label": "Toneladas transportadas",
            "titulo": "Toneladas transportadas",
            "valor": 430000,
            "unidad": "t",
            "nota": "Año 2024 (PDF).",
            "icono": "weight",
            "def": "Macroinsumos transportados de puertos y almacén tercero a molinos durante 2024."
          }
        ],
        "flujo": [
          {
            "icono": "map-pin",
            "nombre": "Puertos",
            "desc": "Paita y Salaverry.",
            "dato": "42% · 58%"
          },
          {
            "icono": "warehouse",
            "nombre": "Almacén tercero",
            "desc": "Almacenamiento antes de molino.",
            "dato": ""
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Flota tercera.",
            "dato": "18 unidades"
          },
          {
            "icono": "factory",
            "nombre": "Molinos",
            "desc": "Milagro, Trujillo y Sullana.",
            "dato": ""
          }
        ],
        "bloques": [
          {
            "tipo": "split",
            "capitulo": "entregas",
            "pregunta": "¿Por qué puerto ingresa?",
            "titulo": "Toneladas por puerto",
            "unidad": "t",
            "partes": [
              {
                "label": "Puerto Salaverry",
                "valor": 108900
              },
              {
                "label": "Puerto Paita",
                "valor": 77900
              }
            ],
            "nota": "Volumen anual del diagrama de red (PDF)."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 4700000,
                "moneda": true
              },
              {
                "label": "Costo por tonelada",
                "valor": 10.97,
                "moneda": true,
                "decimales": 2
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 12,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 18,
          "composicion": [
            {
              "label": "Flota tercera (FT)",
              "valor": 18
            }
          ],
          "tipo": "Volquete / granelero",
          "detalle": "18 unidades · flota tercera",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF."
        ]
      },
      "Almacén central": {
        "area": "ALMACEN CENTRAL",
        "responsable": "José Obregoso / Clevex",
        "kpis": [
          {
            "label": "Toneladas despachadas",
            "titulo": "Toneladas despachadas",
            "valor": 700,
            "unidad": "t",
            "nota": "Año 2024 (PDF).",
            "icono": "weight",
            "def": "Materiales e insumos despachados desde el almacén central durante 2024."
          }
        ],
        "flujo": [
          {
            "icono": "warehouse",
            "nombre": "Almacén central",
            "desc": "Recepción y almacenamiento.",
            "dato": ""
          },
          {
            "icono": "truck",
            "nombre": "Transporte",
            "desc": "Flota tercera.",
            "dato": "1 unidad"
          },
          {
            "icono": "flag",
            "nombre": "Destinos",
            "desc": "Ruedas, plantas, molinos y granjas.",
            "dato": "11 destinos"
          }
        ],
        "bloques": [
          {
            "tipo": "ranking",
            "capitulo": "canales",
            "pregunta": "¿A qué destinos atendemos?",
            "titulo": "Despachos por destino",
            "unidad": "t",
            "sustantivo": "destino",
            "partes": [
              {
                "label": "Rueda Centro",
                "valor": 26.2
              },
              {
                "label": "Rueda Norte",
                "valor": 20.1
              },
              {
                "label": "PI Trujillo",
                "valor": 8.2
              },
              {
                "label": "GR Sausal",
                "valor": 7.5
              },
              {
                "label": "Rueda Sur",
                "valor": 6.2
              },
              {
                "label": "GR Levante Facala",
                "valor": 5.5
              },
              {
                "label": "GR Mocan",
                "valor": 3.2
              },
              {
                "label": "PI Chiclayo",
                "valor": 0.6
              },
              {
                "label": "Molino Sullana",
                "valor": 0.3
              },
              {
                "label": "Molino Trujillo",
                "valor": 0.2
              },
              {
                "label": "Molino Milagro",
                "valor": 0.1
              }
            ],
            "nota": "Toneladas por destino del diagrama de red."
          },
          {
            "tipo": "stats",
            "capitulo": "resultados",
            "pregunta": "¿Cuánto cuesta la operación?",
            "titulo": "Costo logístico · año 2024",
            "items": [
              {
                "label": "Costo logístico anual",
                "valor": 210000,
                "moneda": true
              },
              {
                "label": "Costo por tonelada",
                "valor": 300.2,
                "moneda": true,
                "decimales": 1
              },
              {
                "label": "Peso en el costo logístico total",
                "valor": 1,
                "unidad": "%",
                "nota": "Según el PDF"
              }
            ]
          }
        ],
        "flota": {
          "unidades": 1,
          "composicion": [
            {
              "label": "Flota tercera (FT)",
              "valor": 1
            }
          ],
          "tipo": "Camión",
          "detalle": "1 unidad · flota tercera",
          "imagen": ""
        },
        "pendientes": [
          "Viajes y kilómetros recorridos: no figuran en el PDF.",
          "Cobertura GPS / Segurtrack de la flota: no figura en el PDF."
        ]
      },
      "Cerdo vivo": {
        "noAplica": true
      },
      "Pavo vivo": {
        "noAplica": true
      }
    }
  }
};
