# Contención de seguridad — Llave Maestra

Este cambio no queda activo hasta volver a desplegar Apps Script.

1. En Apps Script, abre **Project Settings → Script Properties**.
2. Define `READS_ENABLED=false` y `WRITES_ENABLED=false`.
3. Genera un valor aleatorio nuevo para `WRITE_SECRET`; no lo pongas en GitHub ni en HTML.
4. Reemplaza `Code.gs` con la versión de este repositorio.
5. Crea un deployment nuevo y revoca el deployment anterior.
6. Revisa el historial del Sheet y los permisos de Drive desde la primera publicación.
7. Mantén las escrituras apagadas hasta implementar identidad por usuario y roles.

El secreto publicado anteriormente debe considerarse comprometido. Cambiar solamente el HTML no cierra el endpoint anterior.
