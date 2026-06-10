# Llave Maestra — Programa de Interiores (Residencia Navarro Muñoz)

Tablero interactivo de Aurum/Yodesarrollo que presenta el programa de interiores de una residencia, conectado en vivo a Google Sheets. Modo cliente (clave "Mona"): navega espacios y piezas, elige opciones A/B, marca lo que incluye, ve total/resumen, exporta PDF. Modo diseñadora (clave "Sayri"): edita/agrega/borra piezas y escribe directo al Google Sheet.

## Estado actual (2026-06-09)

Muy avanzado, en uso (desplegado en GitHub Pages, conectado al Sheet). Los pendientes 1, 3 y 6 del traspaso original quedaron IMPLEMENTADOS en esta versión.

**Funciona:** lectura+escritura al Sheet; landing con matriz de proyectos + gate por clave; vista Por espacios (dossier con render+ficha+barra de presupuesto+una categoría por pantalla); vista Por tipos; opciones A/B; todas las piezas incluibles (con o sin precio); botón Comprar/Contactar proveedor; lightbox; resumen por espacio; PDF; modo diseñadora completo (editar/agregar/borrar + POST al Sheet, historial, autosave); acabados con Ubicación; imágenes Drive estables; encabezado responsive. Nuevo (2026-06-09):

1. **Observaciones por categoría** (`obs_*` en Espacios): visibles al cliente bajo la categoría activa del dossier; editables inline en modo diseñadora (textarea + "Guardar observaciones" → upsert a Espacios). Slug por categoría vía `obsKey()` (sin acentos): obs_renders, obs_acabados, obs_mobiliario, obs_luminarias, obs_carpinteria, obs_herrajes, obs_textiles, obs_decoracion, obs_equipamiento.
2. **Ocultar/mostrar sin borrar** (columna `oculto` en hojas de piezas): "ojito" junto al lápiz en modo diseñadora (toggle + upsert inmediato); en cliente, `liveRows()` filtra `oculto` truthy, y los ocultos quedan fuera de BUYABLE/selección/totales/PDF. En diseñadora la pieza oculta se ve atenuada (.is-hidden).
3. **Acomodo de foto** (columna `imgpos`): select en el editor (top/center/bottom/left/right/contain); `imgStyle()` lo aplica como object-position (o object-fit:contain) en itemCard, optionCard y carpentryCard. Vacío = automático. Acepta también valores custom tipo "50% 20%".

**Paquete de mejoras (2026-06-09, segunda tanda, todas implementadas y validadas):**
- Imágenes: tarjetas cargan miniatura Drive `w400` (lightbox/zoom sigue en `w1600`), fade-in al cargar (`#app img.ld` + listener global + `scanImgs()`), preconnect a lh3/drive.
- Compartir: `og:image`/`og:url`/`twitter:card large` con el render principal (id fijo en el head; si cambia el hero, actualizar esa meta).
- Dossier: botones ← espacio anterior / siguiente → (`.dnav`) y "Siguiente: <categoría> →" (`.catnext`) al final de cada grupo.
- Lightbox: swipe táctil (touchstart/touchend en `#lb`).
- Barra de selección: total con clase `ok`/`over` según presupuesto global (suma de budget de Espacios), pulso al incluir (`#selTotalFig.pulse`), compacta en móvil.
- PDF: observaciones `obs_*` por espacio (`.pobsw`) y pie "Generado el <fecha> · v<versión>" (`.pfoot`).
- Robustez: cola de escrituras `aurum_postq_v1` con reintento (evento online + cada 45 s) + toast global (`showToast`); fallos de POST en editor/ojito/obs/eliminar van a la cola.
- Ojito: toast "Pieza oculta — Deshacer".
- Editor: botón Duplicar (id nuevo + " (copia)" + upsert), preview de imagen (`.ed-prev`, se actualiza al teclear), valida precio no numérico (limpia $ y comas) e id duplicado.
- Datos: badge "En vivo · hace X min" (refresca cada minuto), auto-refresh cada 10 min si la pestaña está visible y el editor cerrado; si el JSON no cambió, no re-renderiza.
- A11y: `:focus-visible` con contorno, `--ink-3` más oscuro (#8a7e6f) para contraste.

**Pendiente / bugs:**
- Seguridad suave: repo público deja visibles `WRITE_SECRET` y la clave "Sayri" (mitigado por el gate; pendiente repo privado/rotar/proxy).
- La fila de acabado sin `id` ya NO existe (verificado vía API 2026-06-09).
- Columna `url` agregada a Acabados (L1) el 2026-06-09 — el botón de contacto en acabados ya es posible; basta llenar la celda.
- Opcional no implementado: columna `orden` para controlar el acomodo de tarjetas (tocaría estructura; decisión de Alejandro).

## Columnas agregadas al Sheet (2026-06-09, ya hechas)

- Espacios: `obs_renders, obs_acabados, obs_mobiliario, obs_luminarias, obs_carpinteria, obs_herrajes, obs_textiles, obs_decoracion, obs_equipamiento` (I1–Q1).
- Productos: `imgpos` (P1), `oculto` (Q1) — ojo: Productos tiene columna extra `proveedor` en O.
- Luminarias, Herrajes, Equipamiento: `imgpos` (O1), `oculto` (P1).
- Carpinteria: `imgpos` (K1), `oculto` (L1).
- Acabados: `oculto` (K1).

NO se re-desplegó Apps Script (doGet lee encabezados dinámicamente; doPost mapea por encabezados).

## Stack

Frontend single-file HTML+CSS+JS vanilla (sin build); fuentes Fraunces/Inter/Spline Sans Mono/Poppins (precios). Backend Google Apps Script (`Code.gs`: doGet lee 16 hojas→JSON; doPost escribe con validación de secreto + log a "Historial"). Datos en Google Sheet. Hosting GitHub Pages (repo público `alexpueblag/interiores-aurum`).

## Archivos del repo

| Archivo | Rol |
|---|---|
| `llave-maestra.html` | El tablero completo (single-file) |
| `Code.gs` | Backend Apps Script (referencia; el vivo se pega en el editor de Apps Script) |
| `instrucciones-llave-maestra.md` | Despliegue |
| `CLAUDE.md` | Este archivo (memoria del proyecto) |

## Estructura del HTML

`<head>` (favicon/meta/fuentes + todo el `<style>`); `<body>` (`#topbar`, `#app`, `#lb` lightbox, `#printDoc`, `#editor`, `#summary`); `<script>` IIFE con CONFIG → `window.AURUM` (datos+snapshot) → helpers (`imgStyle`, `isHid`, `liveRows`, `obsKey`…) → índices (BUYABLE/BUY_BY_ID/OPT_GROUPS) → `state` → renders → modo diseñadora (editor/postSheet/`toggleHide`/`saveObs`) → selección → lightbox/resumen/PDF → delegado de clics (`data-hide`, `data-obssave`…)+teclado.

## Decisiones importantes (no revertir sin razón)

1. Single-file vanilla sin build (despliegue trivial desde Chromebook).
2. Sheets como datos + Apps Script como API (la diseñadora edita sin tocar código).
3. GitHub Pages (hosting/URL estable).
4. Escritura optimista local + POST (fluidez).
5. Re-desplegar Apps Script conservando la URL `/exec` (no cambiar SHEET_URL). NUNCA crear implementación nueva.
6. Dos claves (Mona cliente / Sayri diseñadora).
7. Imágenes Drive vía thumbnail `sz=w1600`.
8. Una categoría por pantalla y todo incluible (decisiones explícitas de Alejandro).
9. Precios en Poppins.
10. Validar con harness antes de entregar (jsdom: carga el HTML real, stub de fetch, prueba liveRows/BUYABLE/dossier/ojito/obs/imgpos).
11. `oculto` se filtra en `liveRows()` y se excluye de BUYABLE para que selección, totales, resumen y PDF queden consistentes sin tocar cada render.

## URLs y datos

- Tablero en vivo: https://alexpueblag.github.io/interiores-aurum/llave-maestra.html
- Repo (público): https://github.com/alexpueblag/interiores-aurum (subir HTML a la RAÍZ)
- API (SHEET_URL, ya en CONFIG): https://script.google.com/macros/s/AKfycbzwkO-JpncB9l_VGAJOQyxvkioyk9re2z50Gef_0FBsZKRsSR9DBGe2M50Lp511FAnu/exec
- Google Sheet (16 hojas): https://docs.google.com/spreadsheets/d/1gRFwq27ec8nM6g_3LG7xW6ORpLhOyTWkPPUQWgAnsok/edit
- CONFIG en el HTML: `ENTRY_KEY="Mona"`, `DESIGNER_KEY="Sayri"`, `WRITE_SECRET="aurum-rnm-2026"` (debe coincidir con el SECRET de Code.gs), `FETCH_TIMEOUT=10000`
- localStorage: `aurum_sel_v2`, `aurum_cache_v1`, `aurum_unlock_v1`; sessionStorage: `aurum_designer_v1`
- 16 hojas: Meta, Concepto, Pilares, Paleta, Materiales, Mood, Productos (Mobiliario/Decoración/Textiles + A/B vía `grupo`+`opcion`), Luminarias, Herrajes, Equipamiento, Acabados (`type`=Piso/Muro/Techo/Cubierta), Carpinteria, Renders, Planos, Espacios, Proyectos, Historial

## Despliegue

- **Front:** editar HTML → subir al repo (raíz) → Ctrl+Shift+R.
- **Back:** pegar Code.gs → Administrar implementaciones → lápiz → Nueva versión → Implementar (conserva `/exec`). NUNCA crear implementación nueva.

## Validación

Harness jsdom (carga el HTML real con fetch stubbeado): 46 pruebas en dos suites — filtrado de ocultos, BUYABLE, obs cliente/diseñadora, imgpos, grupos A/B, miniaturas w400 vs zoom w1600, nav del dossier, selbar ok/over+pulso, toast, cola offline→flush, duplicar, validaciones del editor, PDF con obs y fecha. Correr antes de cada entrega.

## Siguiente paso

Probar en producción como diseñadora (ocultar pieza, observación, imgpos, duplicar) y como cliente en móvil (swipe del lightbox, barra compacta). Después, a elección: seguridad (repo privado/rotar secreto/proxy) o columna opcional `orden`.

## Preferencias de trabajo

- Español es-MX, conciso, sin emojis.
- Entregar archivos completos listos para desplegar (no parches).
- Siempre dar pasos de despliegue; validar antes de entregar.
- A veces escribe por voz (typos).
