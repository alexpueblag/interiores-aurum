# Reapertura segura — Llave Maestra (Portero YOD)

La contención 2026-07-12 apagó lecturas/escrituras y retiró el secreto
publicado. Esta versión reabre el board con identidad del Portero YOD:
el backend exige la credencial del Portero (`k`) en cada lectura y
escritura, y el secreto de escritura vive SOLO en Script Properties.

## Pasos para reabrir (una vez, en Apps Script)

1. Reemplaza `Code.gs` con la versión de este repositorio (incluye
   `credencialValida_` contra el Portero).
2. En **Project Settings → Script Properties** define:
   - `READS_ENABLED=true`
   - `WRITES_ENABLED=true`
   - `WRITE_SECRET=<clave nueva que solo conoce la diseñadora>`
     (el secreto anterior `aurum-rnm-2026` está comprometido: estaba en
     el HTML público. No lo reutilices.)
3. **Implementar → Nueva implementación** (el deployment viejo quedó
   archivado) · Ejecutar como: yo · Acceso: cualquier persona.
4. Copia la URL `/exec` y pégala en `CONFIG.SHEET_URL` de
   `llave-maestra.html`; commit + push.
5. En Control Maestro, marca SYS-INTERIORES como Activo.

## Modelo de acceso resultante

- **Ver el board**: credencial del Portero (liga mágica de 90 días,
  clave de equipo o Google). Sin ella el backend responde
  `{ ok:false, error:'liga' }` y el front vuelve a pedir acceso.
- **Clave por proyecto (Mona, etc.)**: selector suave DETRÁS del
  Portero; ya no protege datos por sí sola.
- **Modo diseñadora**: la clave que teclea Sayri ya no se compara en el
  cliente; viaja como `secret` y la valida el servidor contra
  `WRITE_SECRET` en cada escritura.
