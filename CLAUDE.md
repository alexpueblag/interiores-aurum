# Llave Maestra — Programa de Interiores (Residencia Navarro Muñoz)

Tablero interactivo de Aurum/Yodesarrollo que presenta el programa de interiores de una residencia, conectado en vivo a Google Sheets. Modo cliente (clave "Mona"): navega espacios y piezas, elige opciones A/B, marca lo que incluye, ve total/resumen, exporta PDF. Modo diseñadora (clave "Sayri"): edita/agrega/borra piezas y escribe directo al Google Sheet.

## Estado actual (2026-06)

Muy avanzado, en uso (desplegado en GitHub Pages, conectado al Sheet).

**Funciona:** lectura+escritura al Sheet; landing con matriz de proyectos + gate por clave; vista Por espacios (dossier con render+ficha+barra de presupuesto+una categoría por pantalla); vista Por tipos; opciones A/B; todas las piezas incluibles (con o sin precio); botón Comprar/Contactar proveedor; lightbox con leyenda/contador/teclado; resumen por espacio; PDF (portada+secciones+total); modo diseñadora completo (editar/agregar/borrar + POST al Sheet, historial, autosave); acabados con Ubicación (Piso/Muro/Techo/Cubierta); imágenes Drive estables y tarjetas de igual tamaño; encabezado responsive (móvil/iPad).

**Pendientes (3, solo requieren agregar columnas al Sheet, NO re-desplegar Apps Script):**
1. Observaciones por categoría editables y visibles al cliente (6 columnas `obs_*` en Espacios).
2. (#3) Ocultar/mostrar piezas con un clic sin borrar (columna `oculto` en hojas de piezas).
3. (#6) Acomodo de foto por imagen (columna `imgpos`).

**Bugs conocidos:**
- Una fila de acabado sin `id` no se puede incluir (muestra "Obra") → ponerle id.
- Seguridad suave: repo público deja visibles `WRITE_SECRET` y la clave "Sayri" (mitigado por el gate; pendiente repo privado/rotar/proxy).
- El POST no se pudo probar desde el entorno de dev (solo validado con harness de 59 pruebas).

## Stack

Frontend single-file HTML+CSS+JS vanilla (sin build); fuentes Fraunces/Inter/Spline Sans Mono/Poppins (precios). Backend Google Apps Script (`Code.gs`: doGet lee 16 hojas→JSON; doPost escribe con validación de secreto + log a "Historial"). Datos en Google Sheet. Hosting GitHub Pages (repo público `alexpueblag/interiores-aurum`).

## Archivos

| Archivo | Rol |
|---|---|
| `llave-maestra.html` | El tablero completo (~168 KB / 1731 líneas) |
| `Code.gs` | Backend Apps Script (252 líneas) |
| `instrucciones-llave-maestra.md` | Despliegue |
| `Aurum_LlaveMaestra_Base_NavarroMunoz.xlsx`, `Equipamiento_*.csv/md` | Carga inicial, histórico |
| `HANDOFF.md` | Traspaso íntegro (Code.gs → instrucciones → llave-maestra.html) |

## Estructura del HTML

`<head>` (favicon/meta/fuentes + todo el `<style>`); `<body>` (`#topbar`, `#app`, `#lb` lightbox, `#printDoc`, `#editor`, `#summary`); `<script>` IIFE con CONFIG → `window.AURUM` (datos+snapshot) → helpers → índices (BUYABLE/BUY_BY_ID/OPT_GROUPS) → `state` → renders → modo diseñadora (editor/postSheet) → selección → lightbox/resumen/PDF → delegado de clics+teclado.

## Decisiones importantes (no revertir sin razón)

1. Single-file vanilla sin build (despliegue trivial desde Chromebook).
2. Sheets como datos + Apps Script como API (la diseñadora edita sin tocar código).
3. GitHub Pages (hosting/URL estable).
4. Escritura optimista local + POST (fluidez).
5. Re-desplegar Apps Script conservando la URL `/exec` (no cambiar SHEET_URL).
6. Dos claves (Mona cliente / Sayri diseñadora).
7. Imágenes Drive vía thumbnail `sz=w1600`.
8. Una categoría por pantalla y todo incluible (decisiones explícitas de Alejandro).
9. Precios en Poppins.
10. Validar con harness antes de entregar.

## URLs y datos

- Tablero en vivo: https://alexpueblag.github.io/interiores-aurum/llave-maestra.html
- Repo (público): https://github.com/alexpueblag/interiores-aurum (subir HTML a la RAÍZ)
- API (SHEET_URL, ya en CONFIG): https://script.google.com/macros/s/AKfycbzwkO-JpncB9l_VGAJOQyxvkioyk9re2z50Gef_0FBsZKRsSR9DBGe2M50Lp511FAnu/exec
- Google Sheet (16 hojas): https://docs.google.com/spreadsheets/d/1gRFwq27ec8nM6g_3LG7xW6ORpLhOyTWkPPUQWgAnsok/edit
- CONFIG en el HTML: `ENTRY_KEY="Mona"`, `DESIGNER_KEY="Sayri"`, `WRITE_SECRET="aurum-rnm-2026"` (debe coincidir con el SECRET de Code.gs), `FETCH_TIMEOUT=10000`
- localStorage: `aurum_sel_v2`, `aurum_cache_v1`, `aurum_unlock_v1`; sessionStorage: `aurum_designer_v1`
- 16 hojas: Meta, Concepto, Pilares, Paleta, Materiales, Mood, Productos (Mobiliario/Decoración/Textiles + A/B vía `grupo`+`opcion`), Luminarias, Herrajes, Equipamiento, Acabados (`type`=Piso/Muro/Techo/Cubierta), Carpinteria, Renders, Planos, Espacios (name, level, surface, dims, floor, ceiling, walls, budget), Proyectos, Historial

## Despliegue

- **Front:** editar HTML → subir al repo (raíz) → Ctrl+Shift+R.
- **Back:** pegar Code.gs → Administrar implementaciones → lápiz → Nueva versión → Implementar (conserva `/exec`). NUNCA crear implementación nueva.

## Siguiente paso

Implementar pendientes 1, 3 y 6: (a) agregar columnas al Sheet (`obs_*` en Espacios; `oculto` e `imgpos` en hojas de piezas); (b) en el HTML: filtrar `oculto` en cliente + "ojito" en diseñadora; aplicar `imgpos` como object-position/fit + control en diseñadora; mostrar `obs_<categoria>` tras cada grupo con edición inline; (c) validar con harness y subir el HTML.

## Preferencias de trabajo

- Español es-MX, conciso, sin emojis.
- Entregar archivos completos listos para desplegar (no parches).
- Siempre dar pasos de despliegue; validar antes de entregar.
- A veces escribe por voz (typos).
