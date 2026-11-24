"""Genera el formato de reunión (validación de datos) a partir del Excel del portal.

Uso:
    python3 herramientas/generar_formato_reunion.py \
        datos/LOGIXSC_Datos_Fichas.xlsx datos/LOGIXSC_Solicitud_Datos_Jefatura.xlsx

Cada cifra que hoy muestra el portal aparece precargada ("Valor actual") con su
origen (PDF, cálculo o interpretación). En la reunión se marca el estado y, si
hace falta, se escribe el valor sincerado. La columna oculta "Ref" indica la
celda de LOGIXSC_Datos_Fichas.xlsx de donde salió cada cifra, para devolver los
cambios con herramientas/aplicar_formato_reunion.py.
"""
import sys
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule

FUENTE, SALIDA = sys.argv[1], sys.argv[2]

# ---------------------------------------------------------------- estilos
F = 'Arial'; NAVY, RED = '052F66', 'E30620'
fT = Font(name=F, bold=True, size=16, color=NAVY); fS = Font(name=F, italic=True, size=10, color='536B84')
fH = Font(name=F, bold=True, size=9, color='FFFFFF'); fillH = PatternFill('solid', fgColor=NAVY)
fEmp = Font(name=F, bold=True, size=13, color='FFFFFF'); fillEmp = PatternFill('solid', fgColor=RED)
fSec = Font(name=F, bold=True, size=10, color=NAVY); fillSec = PatternFill('solid', fgColor='DCE7F3')
fSub = Font(name=F, bold=True, size=9, color='2B4A6B'); fillSub = PatternFill('solid', fgColor='F2F6FA')
fQ = Font(name=F, italic=True, size=9, color='536B84')
fB = Font(name=F, size=10); fBold = Font(name=F, size=10, bold=True)
fIn = Font(name=F, size=10, color='0000FF'); fillIn = PatternFill('solid', fgColor='FFF7CC')
fCalc = Font(name=F, size=10, color='000000'); fillCalc = PatternFill('solid', fgColor='EEF4F9')
fRef = Font(name=F, size=8, color='8A9BAD')
thin = Side(style='thin', color='C9D5E1'); BD = Border(left=thin, right=thin, top=thin, bottom=thin)
WR = Alignment(wrap_text=True, vertical='top'); CEN = Alignment(horizontal='center', vertical='center', wrap_text=True)
RIGHT = Alignment(horizontal='right', vertical='top')

COLS = ['Concepto', 'Valor actual (portal)', 'Unidad', 'Origen', 'Cómo se obtuvo / observación',
        'Estado', 'Valor sincerado', 'Valor final', 'Comentario de jefatura', 'Ref']
WIDTHS = [34, 16, 11, 14, 44, 14, 16, 16, 38, 30]
NC = len(COLS)
ESTADOS = '"Correcto,Corregir,No publicar,No existe"'
NEGOCIOS = ['Pollo vivo', 'Cerdo vivo', 'Pavo vivo', 'Pollo bebé', 'Huevo incubable',
            'Alimento balanceado', 'Macroinsumos', 'Almacén central']
EMPRESAS = ['SAN FERNANDO', 'CHIMU']

# ---------------------------------------------------------------- lectura de la fuente
src = load_workbook(FUENTE)

def tabla(hoja, primera):
    ws = src[hoja]
    for r in range(1, 12):
        if ws.cell(r, 1).value == primera:
            cab = [c.value for c in ws[r]]
            filas = []
            for rr in range(r + 1, ws.max_row + 1):
                vals = [ws.cell(rr, j + 1).value for j in range(len(cab))]
                if all(v is None for v in vals):
                    continue
                d = dict(zip(cab, vals)); d['_fila'] = rr; d['_col'] = {k: j + 1 for j, k in enumerate(cab)}
                filas.append(d)
            return filas
    raise SystemExit('No se encontró la tabla de ' + hoja)

def ref(hoja, fila, col_nombre):
    from openpyxl.utils import get_column_letter
    return '%s!%s%d' % (hoja, get_column_letter(fila['_col'][col_nombre]), fila['_fila'])

negocios = tabla('Negocios', 'Empresa')
kpis = tabla('KPIs', 'Empresa')
flotas = tabla('Flota', 'Empresa')
compos = tabla('Flota_Composicion', 'Empresa')
bloques = tabla('Bloques', 'Empresa')
valores = tabla('Bloques_Valores', 'ID bloque')
pendientes = tabla('Pendientes', 'Empresa')
config = {f['Clave']: f['Valor'] for f in tabla('Config', 'Clave')}

def de(lista, emp, neg):
    return [f for f in lista if f['Empresa'] == emp and f['Negocio'] == neg]

# Datos que los PDF no traen y que se piden en la reunión (alcances del negocio).
FALTANTES_COMUNES = [('Viajes realizados en el año', 'viajes'), ('Kilómetros recorridos en el año', 'km')]
FALTANTES = {
    'Pollo vivo': [('Venta de pollo · promedio mensual', 't (confirmar)'),
                   ('Entrega con distribución (flota de la empresa)', '%'), ('Recoge el cliente', '%'),
                   ('Canal: distribuidores', '%'), ('Canal: mayoristas distribución', '%'),
                   ('Canal: mayoristas Norte', '%'), ('Canal: mayoristas Sur', '%')],
    'Alimento balanceado': [('Despacho a granel (tolvas)', '%'), ('Despacho ensacado', '%'),
                            ('Costo de traslado planta → granja · promedio mensual', 'S/')],
    'Macroinsumos': [('Costo de almacenaje en almacén tercero (año)', 'S/'),
                     ('Costo de traslado puerto → almacén tercero (año)', 'S/')],
    'Almacén central': [('Costo de almacenaje (año)', 'S/')],
}
PREGUNTAS = {
    'Pollo vivo': ['¿Quién reporta los km y viajes de este negocio (Roberto / Julio Cuadros)?',
                   '¿"Mayoristas Norte" y "Mayoristas Sur" son zonas dentro de mayoristas o canales aparte?',
                   '¿La venta de pollo se mide en toneladas, kg o número de aves?'],
    'Cerdo vivo': ['¿Quién es el responsable de los datos?', '¿Qué flota y costo logístico tiene el negocio?'],
    'Pavo vivo': ['¿Quién es el responsable de los datos?', '¿Qué flota y costo logístico tiene el negocio?'],
    'Alimento balanceado': ['¿El costo de traslado incluye flota propia y de terceros?'],
    'Macroinsumos': ['¿El % que pasa por almacén tercero se calcula sobre toneladas recibidas?'],
}
GENERICOS = ('Viajes y kilómetros', 'Cobertura GPS', 'Flota y costo logístico')

# ---------------------------------------------------------------- escritura
wb = Workbook()
inst = wb.active; inst.title = 'Instrucciones'
hojas_neg = {}

def celda(ws, r, c, v=None, kind='txt', fmt=None, bold=False):
    x = ws.cell(r, c, v); x.border = BD; x.alignment = WR
    if kind == 'in': x.font = fIn; x.fill = fillIn
    elif kind == 'calc': x.font = fCalc; x.fill = fillCalc
    elif kind == 'ref': x.font = fRef
    else: x.font = fBold if bold else fB
    if fmt: x.number_format = fmt
    if isinstance(v, (int, float)) and kind != 'ref': x.alignment = RIGHT
    return x

def barra(ws, r, texto, font, fill, alto=None):
    for j in range(1, NC + 1):
        ws.cell(r, j).fill = fill
    ws.cell(r, 1, texto).font = font
    if alto: ws.row_dimensions[r].height = alto
    return r + 1

def cabecera(ws, r):
    for j, v in enumerate(COLS, 1):
        x = ws.cell(r, j, v); x.font = fH; x.fill = fillH; x.alignment = CEN; x.border = BD
    ws.row_dimensions[r].height = 28
    return r + 1

def formato_num(v, dec=None, unidad=None):
    if not isinstance(v, (int, float)): return None
    if dec: return '#,##0.' + '0' * int(dec)
    if isinstance(v, float) and v != int(v):
        txt = repr(v).split('.')[-1]
        return '#,##0.' + '0' * min(len(txt), 3)
    return '#,##0'

def fila_dato(ws, r, concepto, valor, unidad, origen, obs, referencia, fmt=None, nuevo=False):
    celda(ws, r, 1, concepto)
    celda(ws, r, 2, valor if valor is not None else '—', 'calc', fmt or formato_num(valor))
    celda(ws, r, 3, unidad)
    celda(ws, r, 4, origen)
    celda(ws, r, 5, obs)
    celda(ws, r, 6, None, 'in')
    celda(ws, r, 7, None, 'in', fmt or formato_num(valor) or '#,##0.##')
    if nuevo:
        f = '=IF(F{r}="No publicar","",IF(G{r}<>"",G{r},""))'
    else:
        f = '=IF(F{r}="No publicar","",IF(G{r}<>"",G{r},B{r}))'
    celda(ws, r, 8, f.format(r=r), 'calc', fmt or formato_num(valor) or '#,##0.##')
    celda(ws, r, 9, None, 'in')
    celda(ws, r, 10, referencia, 'ref')
    return r + 1

for neg in NEGOCIOS:
    ws = wb.create_sheet(neg[:31]); hojas_neg[neg] = ws
    for j, w in enumerate(WIDTHS, 1):
        ws.column_dimensions[ws.cell(1, j).column_letter].width = w
    ws.column_dimensions['J'].hidden = True
    ws.cell(1, 1, neg + ' · validación de datos').font = fT
    ws.cell(2, 1, 'Cifras que hoy muestra el portal (PDF de red logística, año 2024). Marcar el Estado de cada fila; '
                  'si la cifra cambia, escribirla en "Valor sincerado".').font = fS
    r = 4
    r = cabecera(ws, r)
    ws.freeze_panes = 'B5'
    dv = DataValidation(type='list', formula1=ESTADOS, allow_blank=True)
    dv.error = 'Elegir: Correcto, Corregir, No publicar o No existe.'; dv.errorTitle = 'Estado'
    ws.add_data_validation(dv)
    preguntas_hoja = []

    for emp in EMPRESAS:
        info = de(negocios, emp, neg)
        info = info[0] if info else None
        r += 1
        r = barra(ws, r, emp, fEmp, fillEmp, 22)
        if info and info.get('Mostrar') == 'No':
            celda(ws, r, 1, 'Este negocio no figura en el PDF de red de ' + emp.title() + '. El portal no muestra ficha.')
            ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=5)
            celda(ws, r, 6, None, 'in'); dv.add(ws.cell(r, 6))
            celda(ws, r, 9, '¿Confirmar que no aplica?', 'in')
            celda(ws, r, 10, None, 'ref')
            r += 1
            continue

        # Datos generales
        r = barra(ws, r, 'DATOS GENERALES', fSec, fillSec)
        ini = r
        if info:
            r = fila_dato(ws, r, 'Responsable de los datos', info.get('Responsable'), None, 'Portal', None, ref('Negocios', info, 'Responsable'))
            r = fila_dato(ws, r, 'Área en Power BI', info.get('Área en Power BI') or '—', None, 'Portal', None, ref('Negocios', info, 'Área en Power BI'))
        r = fila_dato(ws, r, 'Jefatura que valida', None, None, 'Reunión', 'Nombre de quien confirma los datos.', None, nuevo=True)
        for rr in range(ini, r): dv.add(ws.cell(rr, 6))

        # 01 Volumen
        ks = sorted(de(kpis, emp, neg), key=lambda k: k['Orden'] or 0)
        if ks:
            r = barra(ws, r, '01 · VOLUMEN  ·  ¿Cuánto movilizamos?', fSec, fillSec)
            ini = r
            for k in ks:
                obs = k.get('Observación') or k.get('Periodo / nota')
                r = fila_dato(ws, r, k['Indicador'], k['Valor'], k['Unidad'], k['Origen'], obs, ref('KPIs', k, 'Valor'))
            for rr in range(ini, r): dv.add(ws.cell(rr, 6))

        # 02 Flota
        fl = de(flotas, emp, neg)
        r = barra(ws, r, '02 · FLOTA  ·  ¿Con qué recursos operamos?', fSec, fillSec)
        ini = r
        if fl:
            f0 = fl[0]
            r = fila_dato(ws, r, 'Total de unidades', f0['Unidades'], 'unidades', f0['Origen'], f0.get('Observación'), ref('Flota', f0, 'Unidades'))
            r = fila_dato(ws, r, 'Tipo de unidad', f0['Tipo de unidad'], None, f0['Origen'], f0.get('Observación'), ref('Flota', f0, 'Tipo de unidad'))
            r = fila_dato(ws, r, 'Detalle de la flota', f0['Detalle'], None, f0['Origen'], 'Texto que se muestra en la ficha.', ref('Flota', f0, 'Detalle'))
            for c in sorted(de(compos, emp, neg), key=lambda c: c['Orden'] or 0):
                r = fila_dato(ws, r, '  · ' + c['Categoría'], c['Unidades'], 'unidades', c['Origen'], c.get('Observación'), ref('Flota_Composicion', c, 'Unidades'))
            r = fila_dato(ws, r, 'Unidades con GPS / Segurtrack', f0.get('Unidades con GPS'), 'unidades', 'No está en el PDF',
                          'Dato pendiente.', ref('Flota', f0, 'Unidades con GPS'), nuevo=f0.get('Unidades con GPS') is None)
        else:
            r = fila_dato(ws, r, 'Total de unidades', None, 'unidades', 'No está en el PDF', 'Dato pendiente.', None, nuevo=True)
            r = fila_dato(ws, r, 'Tipo de unidad', None, None, 'No está en el PDF', 'Dato pendiente.', None, nuevo=True)
            r = fila_dato(ws, r, 'Unidades con GPS / Segurtrack', None, 'unidades', 'No está en el PDF', 'Dato pendiente.', None, nuevo=True)
        for rr in range(ini, r): dv.add(ws.cell(rr, 6))

        # Bloques (repartos, rankings y costos)
        bs = sorted(de(bloques, emp, neg), key=lambda b: b['Orden'] or 0)
        etiquetas = {'entregas': '03 · REPARTO', 'canales': '04 · DESTINOS', 'resultados': '05 · COSTOS'}
        ultimo = None
        for b in bs:
            cap = etiquetas.get(b['Capítulo'], b['Capítulo'])
            if cap != ultimo:
                r = barra(ws, r, cap, fSec, fillSec); ultimo = cap
            r = barra(ws, r, b['Título'] + '  —  ' + (b['Pregunta del capítulo'] or ''), fSub, fillSub)
            ini = r
            vs = sorted([v for v in valores if v['ID bloque'] == b['ID bloque']], key=lambda v: v['Orden'] or 0)
            for v in vs:
                unidad = 'S/' if v.get('Moneda (S/)') == 'Sí' else (v.get('Unidad') or b.get('Unidad'))
                obs = v.get('Observación') or v.get('Nota') or b.get('Nota')
                fmt = formato_num(v['Valor'], v.get('Decimales'))
                r = fila_dato(ws, r, v['Etiqueta'], v['Valor'], unidad, v['Origen'], obs, ref('Bloques_Valores', v, 'Valor'), fmt)
            for rr in range(ini, r): dv.add(ws.cell(rr, 6))
            if b['Tipo'] == 'split' and b.get('Unidad') == '%' and r > ini:
                celda(ws, r, 1, 'Control: la suma debe ser 100', bold=True)
                celda(ws, r, 2, '=SUM(B%d:B%d)' % (ini, r - 1), 'calc', '0.#')
                celda(ws, r, 8, '=SUM(H%d:H%d)' % (ini, r - 1), 'calc', '0.#')
                celda(ws, r, 9, '=IF(ROUND(H%d,1)=100,"OK","Revisar: no suma 100")' % r, 'calc')
                r += 1

        # Datos que faltan
        r = barra(ws, r, 'DATOS QUE NO ESTÁN EN EL PDF  ·  Pedir en la reunión', fSec, fillSec)
        ini = r
        for concepto, unidad in FALTANTES_COMUNES + FALTANTES.get(neg, []):
            r = fila_dato(ws, r, concepto, None, unidad, 'No está en el PDF', 'Indicar el periodo (2024 u otro) en el comentario.', 'nuevo', nuevo=True)
        for rr in range(ini, r): dv.add(ws.cell(rr, 6))

        # Preguntas de esta empresa
        for p in de(pendientes, emp, neg):
            if not p['Texto'].startswith(GENERICOS):
                preguntas_hoja.append((emp, p['Texto']))

    # Preguntas para confirmar
    r += 1
    r = barra(ws, r, 'PREGUNTAS PARA CONFIRMAR', fEmp, fillEmp, 22)
    for j, v in enumerate(['Empresa', 'Pregunta', None, None, None, 'Respuesta', None, None, None], 1):
        x = ws.cell(r, j, v); x.font = fH; x.fill = fillH; x.alignment = CEN; x.border = BD
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5)
    ws.merge_cells(start_row=r, start_column=6, end_row=r, end_column=9)
    r += 1
    for emp, texto in preguntas_hoja + [('Ambas', q) for q in PREGUNTAS.get(neg, [])]:
        celda(ws, r, 1, emp)
        celda(ws, r, 2, texto)
        for j in range(3, 6): celda(ws, r, j)
        ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5)
        for j in range(6, 10): celda(ws, r, j, None, 'in')
        ws.merge_cells(start_row=r, start_column=6, end_row=r, end_column=9)
        ws.row_dimensions[r].height = 30
        r += 1

    # Resaltados
    ult = r
    naranja = PatternFill('solid', fgColor='FCE3D3'); verde = PatternFill('solid', fgColor='DDF1E4'); gris = PatternFill('solid', fgColor='E6E9ED')
    ws.conditional_formatting.add('F5:F%d' % ult, FormulaRule(formula=['$F5="Corregir"'], fill=naranja, font=Font(name=F, bold=True, color='9A3412')))
    ws.conditional_formatting.add('F5:F%d' % ult, FormulaRule(formula=['$F5="Correcto"'], fill=verde, font=Font(name=F, color='18794E')))
    ws.conditional_formatting.add('F5:F%d' % ult, FormulaRule(formula=['OR($F5="No publicar",$F5="No existe")'], fill=gris))
    ws.conditional_formatting.add('D5:D%d' % ult, FormulaRule(formula=['$D5="Interpretación"'], fill=naranja, font=Font(name=F, bold=True, color='9A3412')))
    ws.conditional_formatting.add('H5:H%d' % ult, FormulaRule(formula=['AND($G5<>"",$G5<>$B5)'], font=Font(name=F, bold=True, color='C2410C')))
    ws.page_setup.orientation = 'landscape'; ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True; ws.print_title_rows = '4:4'
    ws.print_area = 'A1:I%d' % (r - 1)

# ---------------------------------------------------------------- instrucciones y avance
ws = inst
for col, w in zip('ABCDEFGH', [3, 26, 14, 14, 14, 14, 14, 40]):
    ws.column_dimensions[col].width = w
ws.cell(1, 2, 'LOGIXSC+ · Validación de datos con jefatura').font = fT
ws.cell(2, 2, 'Fuente actual: ' + str(config.get('Fuente SAN FERNANDO', '')) + ' / ' + str(config.get('Fuente CHIMU', ''))).font = fS
r = 4
def tit(r, t):
    for j in range(2, 9): ws.cell(r, j).fill = fillEmp
    ws.cell(r, 2, t).font = fEmp
    return r + 1
r = tit(r, 'CÓMO USAR ESTE FORMATO')
pasos = [
    ('1.', 'Hay una hoja por negocio, con San Fernando y Chimu. Cada fila es una cifra que hoy muestra el portal.'),
    ('2.', '"Valor actual" viene de los PDF de red logística (2024). Origen: PDF = leído tal cual; Cálculo = suma o división de cifras del PDF; Interpretación = lectura que hay que confirmar (resaltada en naranja).'),
    ('3.', 'En "Estado" elegir: Correcto, Corregir (escribir el dato en "Valor sincerado"), No publicar o No existe.'),
    ('4.', '"Valor final" se calcula solo: es el valor sincerado si se escribió uno; si no, el valor actual.'),
    ('5.', 'Valores en números, sin unidades ni símbolos (1460000, no "S/ 1.46 M"; 17, no "17%").'),
    ('6.', 'Al final de cada empresa están los datos que no figuran en el PDF (viajes, km, GPS…) y al final de la hoja, las preguntas.'),
    ('7.', 'Después de la reunión, los valores finales se pasan a datos/LOGIXSC_Datos_Fichas.xlsx (columna oculta "Ref": celda de origen) y el portal se actualiza.'),
]
for n, t in pasos:
    ws.cell(r, 2, n).font = fBold; ws.cell(r, 2).alignment = Alignment(horizontal='right', vertical='top')
    x = ws.cell(r, 3, t); x.font = fB; x.alignment = WR
    ws.merge_cells(start_row=r, start_column=3, end_row=r, end_column=8)
    ws.row_dimensions[r].height = 30 if len(t) > 95 else 16
    r += 1
r += 1
r = tit(r, 'LEYENDA')
ley = [('Para llenar', 'in'), ('Cálculo automático o valor actual (no escribir)', 'calc')]
for t, k in ley:
    celda(ws, r, 2, 'Ejemplo' if k == 'in' else 1250, k)
    ws.cell(r, 3, t).font = fB
    r += 1
x = ws.cell(r, 2, 'Interpretación'); x.fill = PatternFill('solid', fgColor='FCE3D3'); x.font = Font(name=F, bold=True, color='9A3412', size=10); x.border = BD
ws.cell(r, 3, 'Lectura del PDF que se debe confirmar').font = fB
r += 2
r = tit(r, 'AVANCE POR NEGOCIO (se actualiza solo)')
for j, v in enumerate(['Negocio', 'Cifras a revisar', 'Correcto', 'Corregir', 'No publicar / no existe', '% revisado', 'Interpretaciones por confirmar'], 2):
    x = ws.cell(r, j, v); x.font = fH; x.fill = fillH; x.alignment = CEN; x.border = BD
ws.row_dimensions[r].height = 30
r += 1
ini = r
for neg in NEGOCIOS:
    q = "'%s'!" % neg
    celda(ws, r, 2, neg, bold=True)
    celda(ws, r, 3, '=COUNTA(%sD:D)-COUNTIF(%sD:D,"Origen")' % (q, q), 'calc', '0')
    celda(ws, r, 4, '=COUNTIF(%sF:F,"Correcto")' % q, 'calc', '0')
    celda(ws, r, 5, '=COUNTIF(%sF:F,"Corregir")' % q, 'calc', '0')
    celda(ws, r, 6, '=COUNTIF(%sF:F,"No publicar")+COUNTIF(%sF:F,"No existe")' % (q, q), 'calc', '0')
    celda(ws, r, 7, '=IF(C{r}=0,"",MIN(1,(D{r}+E{r}+F{r})/C{r}))'.format(r=r), 'calc', '0%')
    celda(ws, r, 8, '=COUNTIF(%sD:D,"Interpretación")' % q, 'calc', '0')
    r += 1
celda(ws, r, 2, 'TOTAL', bold=True)
for j, col in zip(range(3, 7), 'CDEF'):
    celda(ws, r, j, '=SUM(%s%d:%s%d)' % (col, ini, col, r - 1), 'calc', '0')
celda(ws, r, 7, '=IF(C{r}=0,"",MIN(1,(D{r}+E{r}+F{r})/C{r}))'.format(r=r), 'calc', '0%')
celda(ws, r, 8, '=SUM(H%d:H%d)' % (ini, r - 1), 'calc', '0')
r += 2
r = tit(r, 'PREGUNTAS GENERALES')
for j, v in enumerate(['Pregunta', None, None, None, 'Respuesta', None, None], 2):
    x = ws.cell(r, j, v); x.font = fH; x.fill = fillH; x.border = BD
ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5)
ws.merge_cells(start_row=r, start_column=6, end_row=r, end_column=8)
r += 1
for q in ['¿El apellido correcto es "Obregoso" (como figura en Power BI) u "Orbegoso"?',
          '"Clevex": ¿nombre completo y rol en Chimu?',
          'En Chimu, el "% de peso en el costo logístico total" no cuadra con los montos del PDF. ¿Cuál es el dato correcto?',
          '¿Se mantienen los datos de 2024 o hay cifras más recientes para publicar?',
          '¿Qué datos NO deben publicarse en el portal (costos, volúmenes)?',
          '¿Quién actualizará los datos y cada cuánto?']:
    celda(ws, r, 2, q)
    for j in range(3, 6): celda(ws, r, j)
    ws.merge_cells(start_row=r, start_column=2, end_row=r, end_column=5)
    for j in range(6, 9): celda(ws, r, j, None, 'in')
    ws.merge_cells(start_row=r, start_column=6, end_row=r, end_column=8)
    ws.row_dimensions[r].height = 30
    r += 1
ws.sheet_view.showGridLines = False
ws.page_setup.orientation = 'landscape'; ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0
ws.sheet_properties.pageSetUpPr.fitToPage = True

wb.save(SALIDA)
print('Generado', SALIDA)
