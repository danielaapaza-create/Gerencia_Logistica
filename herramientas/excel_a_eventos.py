"""Pasa datos/LOGIXSC_Eventos_Hitos.xlsx a los archivos de datos del portal.

Uso:
    python3 herramientas/excel_a_eventos.py datos/LOGIXSC_Eventos_Hitos.xlsx

Escribe js/eventos-datos.js (hoja Agenda) y js/hitos-datos.js (hojas Hitos y
Aniversarios_Bienvenidas). Conserva el comentario de instrucciones de cada
archivo. Solo toma las filas cuyo "Control" no indica un dato faltante;
los aniversarios y bienvenidas solo se publican si la persona autorizó ("Sí").
"""
import sys, os, re, json, glob, datetime as dt
from openpyxl import load_workbook

XLSX = sys.argv[1]
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
wb = load_workbook(XLSX, data_only=False)
avisos = []

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre']
EMPRESA = {'san fernando': 'SAN FERNANDO', 'chimu': 'CHIMU', 'ambas': 'AMBAS'}
CATEG = {'lanzamiento': 'lanzamiento', 'hito operativo': 'operativo', 'reconocimiento': 'reconocimiento',
         'capacitación': 'capacitacion', 'capacitacion': 'capacitacion', 'actividad del equipo': 'equipo'}
AREAS_BASE = {  # nombre en el Excel -> (clave, icono, corto)
    'Toda la gerencia': ('TODOS', 'users', None),
    'Facturación y proyectos': ('FACT-PROY', 'list-checks', None),
    'Macroinsumos, Alimento, Pollo bebé y Huevo incubable': ('MI-AB-BB-HI', 'package', 'Macroinsumos · Alimento · BB · HI'),
    'Aves vivas': ('AVES-VIVAS', 'bird', None),
    'Pollo vivo': ('POLLO-VIVO', 'bird', None), 'Pollo bebé': ('POLLO-BEBE', 'bird', None),
    'Huevo incubable': ('HUEVO-INCUBABLE', 'egg', None), 'Alimento balanceado': ('ALIMENTO', 'package', None),
    'Macroinsumos': ('MACROINSUMOS', 'container', None), 'Almacén central': ('ALMACEN-CENTRAL', 'warehouse', None),
    'Cerdo vivo': ('CERDO-VIVO', 'paw-print', None), 'Pavo vivo': ('PAVO-VIVO', 'bird', None),
}

def txt(v):
    if v is None: return None
    s = str(v).strip()
    return s or None

def filas(nombre):
    ws = wb[nombre]
    cab = [txt(c.value) for c in ws[4]]
    for r in range(5, ws.max_row + 1):
        vals = [ws.cell(r, j + 1).value for j in range(len(cab))]
        if all(v is None or (isinstance(v, str) and (not v.strip() or v.startswith('='))) for v in vals):
            continue
        yield r, dict(zip(cab, vals))

def col(d, inicio):
    for k, v in d.items():
        if k and k.startswith(inicio):
            return v
    return None

def fecha_iso(v):
    if isinstance(v, (dt.datetime, dt.date)): return v.strftime('%Y-%m-%d')
    if isinstance(v, str) and re.match(r'\d{1,2}/\d{1,2}/\d{4}$', v.strip()):
        d, m, a = map(int, v.strip().split('/')); return '%04d-%02d-%02d' % (a, m, d)
    return None

def hora(v):
    if isinstance(v, dt.time): return v.strftime('%H:%M')
    if isinstance(v, dt.datetime): return v.strftime('%H:%M')
    if isinstance(v, (int, float)) and 0 <= v < 1:
        m = round(v * 24 * 60); return '%02d:%02d' % (m // 60, m % 60)
    if isinstance(v, str) and re.match(r'\d{1,2}:\d{2}$', v.strip()):
        h, m = v.strip().split(':'); return '%02d:%s' % (int(h), m)
    return None

def foto(nombre):
    n = txt(nombre)
    if not n: return None
    n = re.sub(r'\s*\(actual\)\s*$', '', n)
    if '/' in n: return n
    hall = glob.glob(os.path.join(RAIZ, 'assets', 'img', '**', n), recursive=True)
    if hall: return os.path.relpath(hall[0], RAIZ).replace(os.sep, '/')
    avisos.append('Foto no encontrada en assets/img: %s (se espera en assets/img/hitos/)' % n)
    return 'assets/img/hitos/' + n

def cabecera(ruta, marcador):
    s = open(ruta, encoding='utf-8').read()
    return s[:s.index(marcador)]

def js(v):
    return json.dumps(v, ensure_ascii=False)

# ------------------------------------------------------------------ Agenda
eventos, areas = [], {}
for r, d in filas('Agenda'):
    f, ini, fin = fecha_iso(col(d, 'Fecha')), hora(col(d, 'Hora inicio')), hora(col(d, 'Hora fin'))
    tipo, area, tema, lugar = txt(col(d, 'Tipo')), txt(col(d, 'Área')), txt(col(d, 'Nombre')), txt(col(d, 'Lugar'))
    if not (f and ini and tipo and area and tema and lugar):
        avisos.append('Agenda fila %d: falta un dato obligatorio; no se publica.' % r); continue
    if area in AREAS_BASE: clave, ic, corto = AREAS_BASE[area]
    else:
        clave = re.sub(r'[^A-Z0-9]+', '-', area.upper().encode('ascii', 'ignore').decode()).strip('-') or 'AREA'; ic, corto = 'layers', None
    areas[clave] = {'nombre': area, 'icono': ic, **({'corto': corto} if corto else {})}
    eventos.append({'fecha': f, 'inicio': ini, 'fin': fin, 'tipo': tipo, 'area': clave, 'tema': tema, 'lugar': lugar,
                    'responsable': txt(col(d, 'Responsable')), 'cancelado': txt(col(d, '¿Cancelado')) == 'Sí'})
eventos.sort(key=lambda e: (e['fecha'], e['inicio']))

ruta_ev = os.path.join(RAIZ, 'js', 'eventos-datos.js')
out = cabecera(ruta_ev, 'const AREAS_EVENTOS')
out += 'const AREAS_EVENTOS = {\n' + ',\n'.join('  %s: %s' % (js(k), js(v)) for k, v in areas.items()) + '\n};\n\n'
out += 'const eventosLogistica = [\n' + ',\n'.join('  ' + js(e) for e in eventos) + '\n];\n'
open(ruta_ev, 'w', encoding='utf-8').write(out)

# ------------------------------------------------------------------ Hitos
hitos = []
for r, d in filas('Hitos'):
    cat = CATEG.get((txt(col(d, 'Categoría')) or '').lower())
    titulo, area, emp = txt(col(d, 'Título')), txt(col(d, 'Área')), EMPRESA.get((txt(col(d, 'Empresa')) or '').lower())
    if not (cat and titulo and area and emp):
        avisos.append('Hitos fila %d: falta un dato obligatorio; no se publica.' % r); continue
    anio, mes, dia = col(d, 'Año'), txt(col(d, 'Mes')), col(d, 'Día')
    fecha = None
    if anio and mes and mes.lower() in MESES:
        fecha = '%04d-%02d' % (int(anio), MESES.index(mes.lower()) + 1) + ('-%02d' % int(dia) if dia else '')
    cifra, que = txt(col(d, 'Impacto: cifra')), txt(col(d, 'Impacto: qué'))
    hitos.append({'fecha': fecha, 'categoria': cat, 'empresa': emp, 'area': area, 'titulo': titulo,
                  'descripcion': txt(col(d, 'Descripción')),
                  'impacto': {'valor': cifra, 'etiqueta': que or ''} if cifra else None,
                  'equipo': txt(col(d, 'Equipo')), 'imagen': foto(col(d, 'Foto')),
                  'confirmar': txt(col(d, '¿Datos confirmados')) != 'Sí'})

for r, d in filas('Aniversarios_Bienvenidas'):
    tipo, nombre, cargo = txt(col(d, 'Tipo')), txt(col(d, 'Nombre')), txt(col(d, 'Cargo'))
    emp, ingreso = EMPRESA.get((txt(col(d, 'Empresa')) or '').lower()), col(d, 'Fecha de ingreso')
    if txt(col(d, '¿Autoriza')) != 'Sí':
        avisos.append('Aniversarios fila %d (%s): sin autorización; no se publica.' % (r, nombre)); continue
    if not (tipo and nombre and cargo and emp and isinstance(ingreso, (dt.date, dt.datetime))):
        avisos.append('Aniversarios fila %d: falta un dato obligatorio; no se publica.' % r); continue
    item = {'categoria': 'aniversario' if tipo.startswith('Aniversario') else 'bienvenida', 'empresa': emp,
            'area': txt(col(d, 'Área')), 'persona': nombre, 'cargo': cargo, 'mensaje': txt(col(d, 'Mensaje')),
            'imagen': foto(col(d, 'Foto')), 'confirmar': False}
    if item['categoria'] == 'aniversario':
        anio = col(d, 'Año en que se publica')
        if not anio:
            avisos.append('Aniversarios fila %d: falta el año en que se publica.' % r); continue
        item['anios'] = int(anio) - ingreso.year
        item['fecha'] = '%04d-%02d-%02d' % (int(anio), ingreso.month, ingreso.day)
    else:
        item['fecha'] = ingreso.strftime('%Y-%m-%d')
    hitos.append(item)

ruta_hi = os.path.join(RAIZ, 'js', 'hitos-datos.js')
out = cabecera(ruta_hi, 'const hitosEquipo')
out += 'const hitosEquipo = [\n' + ',\n'.join('  ' + js(h) for h in hitos) + '\n];\n'
open(ruta_hi, 'w', encoding='utf-8').write(out)

print('Agenda: %d eventos -> js/eventos-datos.js' % len(eventos))
print('Hitos: %d (incluye aniversarios y bienvenidas) -> js/hitos-datos.js' % len(hitos))
for a in avisos: print('  AVISO:', a)
