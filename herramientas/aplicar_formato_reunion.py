"""Pasa los valores sincerados del formato de reunión al Excel del portal.

Uso:
    python3 herramientas/aplicar_formato_reunion.py \
        datos/LOGIXSC_Solicitud_Datos_Jefatura.xlsx datos/LOGIXSC_Datos_Fichas.xlsx

- Cada fila con "Valor sincerado" y una referencia en la columna oculta "Ref"
  se copia a esa celda de LOGIXSC_Datos_Fichas.xlsx.
- Las filas sin referencia (datos nuevos: viajes, km, GPS, canales…), las
  marcadas "No publicar" / "No existe" y las preguntas respondidas se listan
  para cargarlas a mano, porque cambian la estructura de la ficha.
- Las cifras de origen "Cálculo" (sumas de otras cifras) no se recalculan solas:
  si se corrige una parte, revisar también el total.
"""
import sys
from openpyxl import load_workbook

FORM, FICHAS = sys.argv[1], sys.argv[2]
EMPRESAS = ('SAN FERNANDO', 'CHIMU')

form = load_workbook(FORM)
fichas = load_workbook(FICHAS)
aplicados, manuales, sin_publicar, respuestas = [], [], [], []

for ws in form.worksheets[1:]:
    empresa = None
    en_preguntas = False
    for r in range(5, ws.max_row + 1):
        a = ws.cell(r, 1).value
        if a in EMPRESAS and ws.cell(r, 2).value is None:
            empresa = a
            continue
        if a == 'PREGUNTAS PARA CONFIRMAR':
            en_preguntas = True
            continue
        if en_preguntas:
            if a not in (None, 'Empresa') and ws.cell(r, 6).value not in (None, ''):
                respuestas.append((ws.title, a, ws.cell(r, 2).value, ws.cell(r, 6).value))
            continue
        estado, nuevo, ref = ws.cell(r, 6).value, ws.cell(r, 7).value, ws.cell(r, 10).value
        etiqueta = '%s · %s · %s' % (empresa, ws.title, a)
        if estado in ('No publicar', 'No existe'):
            sin_publicar.append((etiqueta, estado, ws.cell(r, 9).value))
            continue
        if nuevo in (None, ''):
            continue
        if ref and '!' in ref:
            hoja, celda = ref.split('!')
            anterior = fichas[hoja][celda].value
            fichas[hoja][celda].value = nuevo
            aplicados.append((etiqueta, anterior, nuevo, ref))
        else:
            manuales.append((etiqueta, nuevo, ws.cell(r, 3).value, ws.cell(r, 9).value))

fichas.save(FICHAS)

print('\nAPLICADOS en %s (%d):' % (FICHAS, len(aplicados)))
for e, a, n, ref in aplicados:
    print('  %-70s %s -> %s  [%s]' % (e, a, n, ref))
print('\nDATOS NUEVOS para cargar a mano (%d):' % len(manuales))
for e, v, u, c in manuales:
    print('  %-70s %s %s  %s' % (e, v, u or '', c or ''))
print('\nMARCADOS "No publicar" / "No existe" (%d): revisar si se quitan de la ficha' % len(sin_publicar))
for e, s, c in sin_publicar:
    print('  %-70s %s  %s' % (e, s, c or ''))
print('\nPREGUNTAS RESPONDIDAS (%d):' % len(respuestas))
for h, emp, q, resp in respuestas:
    print('  [%s · %s] %s\n      -> %s' % (h, emp, q, resp))
