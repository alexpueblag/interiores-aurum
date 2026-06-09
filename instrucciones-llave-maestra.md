# Llave Maestra — Etapa 2 · instrucciones

Tres archivos:
- **llave-maestra.html** → el board (lo subes a tu repo, igual que siempre).
- **Code.gs** → el Apps Script actualizado (lectura + escritura). **Sin esto, editar no se guarda en el Sheet.**
- este `.md`.

---

## 1) Subir el board (1 min)
1. Repo `interiores-aurum` (usuario alexpueblag) → **Add file ▸ Upload files**.
2. Arrastra **llave-maestra.html** (mismo nombre, en la raíz) → **Commit changes**.
3. Espera ~1 min. URL: `https://alexpueblag.github.io/interiores-aurum/llave-maestra.html`

Ya con esto funciona el **arreglo de imágenes** y el **modo diseñadora en local** (puedes editar y se ve al instante). Para que lo que edites **se guarde en el Sheet**, falta el paso 2.

---

## 2) Re-desplegar el Apps Script — CRÍTICO ⚠️
Esto es lo que habilita la **escritura**. Mientras no lo hagas, al editar verás *"guardado local; el Sheet no respondió"*: el cambio se ve en pantalla pero no llega al Sheet.

1. Abre el Sheet → **Extensiones ▸ Apps Script**.
2. Borra todo lo que haya en el editor y **pega el contenido completo de `Code.gs`**. Guarda (💾).
3. Arriba a la derecha: **Implementar ▸ Administrar implementaciones**.
4. En tu implementación de tipo *Aplicación web*, pica el **lápiz (Editar)**.
5. En **Versión** elige **Nueva versión** → **Implementar**.
   - Así se **conserva la MISMA URL `/exec`** y tu board sigue jalando sin cambiarle nada.
   - ❗ No uses *"Nueva implementación"*: esa genera una URL distinta y rompería la conexión.
6. Si te pide permisos, acéptalos (Ejecutar como **Yo**, acceso **Cualquiera**).

Para probar: entra al board, modo **Diseñadora** (clave `Sayri`), edita cualquier tarjeta y guarda. Debe decir **"guardado en el Sheet ✓"**. En el Sheet aparecerá una hoja nueva **Historial** con el registro.

---

## 3) Hoja "Proyectos" (volver reales las 4 residencias dummy)
La portada lee una hoja llamada **Proyectos** si existe. Crea una pestaña con estas columnas (fila 1 = encabezados, exactos):

| id | name | sub | active | key | cover | url |
|----|------|-----|--------|-----|-------|-----|
| rnm | Residencia Navarro Muñoz | Las Riberas · Hermosillo | sí | Mona | | |
| (id) | (nombre) | (subtítulo) | sí / no | (clave de acceso) | (link Drive de portada) | (liga a su propio board) |

- **active**: `sí` la muestra abierta/con clave; `no` la deja como *Próximamente*.
- **key**: la clave que pide al entrar (si la dejas vacía usa `Mona`).
- **cover**: link de Drive de la imagen de portada (opcional; si lo dejas vacío usa el render principal).
- **url**: si esa residencia tendrá **su propio board**, pega aquí su liga y la tarjeta lo abrirá directo. Si lo dejas vacío, abre el board actual con su clave.

Cuando exista la hoja, la portada se arma sola desde ahí (ya no desde el código).

---

## 4) Renglones del Sheet por corregir
En el board ya **no aparece el lápiz de editar** en las filas que no tienen `id` (no se pueden referenciar). Para que sean editables, dales un `id` único:

- **Luminarias** — 4 filas con precio pero sin `id` (lámpara arco Flos, riel Lumens, candil esférico Pulpo, lectura Marset). Ponles `l11`, `l12`, `l13`, `l14`.
- **Acabados** — la fila *"Recubrimiento cocina · cajillo"* trae las **columnas corridas** (el nombre quedó en `type`, el espacio en `name`, etc.). Reacomódala a sus columnas correctas y dale `id` = `f09`.
- **Carpinteria** — 3 filas vacías (`c04`, `c05`, `c06`): lléналas o bórralas.

> Tip: una vez desplegado el paso 2, en lugar de tocar el Sheet a mano puedes usar **Agregar** desde el modo diseñadora; el board genera el `id` solo.

---

## 5) Imágenes de Drive
Para que se vean, cada imagen debe estar compartida como **"Cualquiera con el enlace"** (Visor). El board ya:
- saca el ID de Drive de **cualquier** forma de link (no importa que no termine en `.jpg`),
- usa un endpoint estable y, si una imagen falla, prueba otro y si no, muestra un recuadro *"Sin imagen"* sin romper la tarjeta.

Si una imagen sigue sin verse, casi siempre es permiso (no está compartida) o el archivo no es imagen.

---

## Cómo se usa el modo diseñadora
- Botón **Diseñadora** (arriba, en el board) → clave **`Sayri`**.
- Aparece un **lápiz** en cada tarjeta/fila y botones **Agregar** por sección.
- El editor guarda **borrador automático** mientras escribes (si se cierra, no pierdes lo tecleado).
- **Guardar** escribe al Sheet · **Eliminar** borra (pide confirmación) · **Historial** muestra los cambios.
- **Salir** apaga el modo. La cliente (clave `Mona`) nunca ve nada de esto.

### Seguridad (pendiente suave)
El board es repo público, así que la clave `Sayri` y el secreto de escritura van en el código. Cualquiera que lea el fuente podría escribir al Sheet. Igual que en el otro board, cuando quieras lo blindamos: repo privado (GitHub Pro), rotar el secreto, o un proxy. Por ahora queda como control suave.
