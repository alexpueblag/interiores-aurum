/****************************************************************
 *  AURUM · Llave Maestra — Apps Script (lectura + escritura)
 *  Pega TODO esto en Extensiones ▸ Apps Script (reemplaza lo que haya)
 *  y luego vuelve a desplegar (ver instrucciones-llave-maestra.md).
 *
 *  doGet  -> entrega el JSON que consume el board (16 hojas)
 *            + _projects (hoja "Proyectos") + _history (hoja "Historial")
 *  doPost -> recibe ediciones desde el modo diseñadora y las escribe
 *            al Sheet. Valida un secreto y registra cada cambio.
 ****************************************************************/

/* Seguridad: nunca guardar credenciales en este archivo ni en el frontend.
 * Configurar WRITE_SECRET, READS_ENABLED y WRITES_ENABLED en Script Properties.
 * El deployment queda cerrado por defecto si faltan esas propiedades. */
function securityConfig_(){
  var p = PropertiesService.getScriptProperties();
  return {
    secret: p.getProperty("WRITE_SECRET") || "",
    reads: p.getProperty("READS_ENABLED") === "true",
    writes: p.getProperty("WRITES_ENABLED") === "true"
  };
}

/* ============================ LECTURA ============================ */
function doGet(e){
  var sec = securityConfig_();
  if(!sec.reads) return json({ ok:false, maintenance:true, error:"acceso temporalmente suspendido" });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = {};

  out.meta = readKV(ss, "Meta");

  var concepto = readKV(ss, "Concepto");
  concepto.body = [concepto.body1, concepto.body2].filter(function(x){ return x && String(x).trim(); });
  delete concepto.body1; delete concepto.body2;
  concepto.pillars = readRows(ss, "Pilares").map(function(r){
    return { t: r.titulo || r.t || "", d: r.texto || r.d || "" };
  });
  out.concept = concepto;

  out.mood = {
    palette: readRows(ss, "Paleta").map(function(r){ return { name: r.name || "", hex: r.hex || "" }; }),
    materials: readColumn(ss, "Materiales", "material"),
    tiles: readRows(ss, "Mood").map(function(r){
      return { label: r.label || "", note: r.note || "", span: r.span || "", img: r.img || "" };
    })
  };

  out.spaces    = numify(readRows(ss, "Espacios"),     ["budget"]);
  out.products  = numify(readRows(ss, "Productos"),    ["price","qty"]);
  out.lighting  = numify(readRows(ss, "Luminarias"),   ["price","qty"]);
  out.hardware  = numify(readRows(ss, "Herrajes"),     ["price","qty"]);
  out.equipment = numify(readRows(ss, "Equipamiento"), ["price","qty"]);
  out.finishes  = numify(readRows(ss, "Acabados"),     ["price","qty"]);
  out.carpentry = numify(readRows(ss, "Carpinteria"),  ["price","qty"]);
  out.renders   = readRows(ss, "Renders");
  out.planos    = readRows(ss, "Planos");

  out._projects = readRows(ss, "Proyectos");          // si la hoja no existe -> []
  out._history  = readRows(ss, "Historial").slice(-120);

  return json(out);
}

/* ============================ ESCRITURA ============================ */
function doPost(e){
  try{
    var sec = securityConfig_();
    if(!sec.writes) return json({ ok:false, error:"escrituras temporalmente suspendidas" });
    var p = JSON.parse(e.postData.contents);
    if(!sec.secret || p.secret !== sec.secret) return json({ ok:false, error:"no autorizado" });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = p.action, tab = p.tab;
    var note = "";

    if(action === "upsert"){
      note = upsertRow(ss, tab, p.keyField, p.key, p.row);
    } else if(action === "append"){
      appendRow(ss, tab, p.row);
      note = "fila agregada";
    } else if(action === "setRow"){
      setRowByIndex(ss, tab, p.index, p.row);
      note = "fila " + p.index + " actualizada";
    } else if(action === "delete"){
      note = deleteRow(ss, tab, p.keyField, p.key);
    } else if(action === "delRow"){
      delRowByIndex(ss, tab, p.index);
      note = "fila " + p.index + " eliminada";
    } else if(action === "kv"){
      setKV(ss, tab, p.pairs);
      note = "campos actualizados";
    } else if(action === "list"){
      replaceList(ss, tab, p.header, p.rows);
      note = (p.rows ? p.rows.length : 0) + " filas reescritas";
    } else {
      return json({ ok:false, error:"accion desconocida: " + action });
    }

    logHistory(ss, tab, (p.key!=null ? p.key : (p.index!=null ? "#"+p.index : "")), action, note);
    return json({ ok:true });
  } catch(err){
    return json({ ok:false, error: String(err) });
  }
}

/* ============================ HELPERS ============================ */
function json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* Busca una hoja tolerando mayusculas/acentos */
function sheet(ss, name){
  var sh = ss.getSheetByName(name);
  if(sh) return sh;
  var norm = function(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); };
  var target = norm(name), all = ss.getSheets();
  for(var i=0;i<all.length;i++){ if(norm(all[i].getName())===target) return all[i]; }
  return null;
}

/* Lee una hoja con encabezado en la fila 1 -> arreglo de objetos */
function readRows(ss, name){
  var sh = sheet(ss, name);
  if(!sh) return [];
  var values = sh.getDataRange().getValues();
  if(values.length < 2) return [];
  var headers = values[0].map(function(h){ return String(h).trim(); });
  var out = [];
  for(var r=1; r<values.length; r++){
    var row = values[r], obj = {}, hasData = false;
    for(var c=0; c<headers.length; c++){
      if(!headers[c]) continue;
      var v = row[c];
      if(v !== "" && v !== null) hasData = true;
      obj[headers[c]] = (v === null ? "" : v);
    }
    if(hasData) out.push(obj);
  }
  return out;
}

/* Hoja campo/valor (2 columnas) -> objeto {clave:valor} */
function readKV(ss, name){
  var sh = sheet(ss, name);
  if(!sh) return {};
  var values = sh.getDataRange().getValues();
  var o = {};
  var start = 0;
  if(values.length && /campo|clave|key|field/i.test(String(values[0][0]))) start = 1; // saltar encabezado si existe
  for(var r=start; r<values.length; r++){
    var k = String(values[r][0]||"").trim();
    if(k) o[k] = values[r][1] === null ? "" : values[r][1];
  }
  return o;
}

/* Devuelve un arreglo con los valores de una columna */
function readColumn(ss, name, col){
  return readRows(ss, name).map(function(r){ return r[col] || r[Object.keys(r)[0]] || ""; })
                           .filter(function(x){ return String(x).trim(); });
}

function numify(arr, fields){
  arr.forEach(function(o){
    fields.forEach(function(f){
      if(f in o){ var n = Number(o[f]); o[f] = isNaN(n) ? 0 : n; }
    });
  });
  return arr;
}

/* --- escritura por fila --- */
function headersOf(sh){
  return sh.getRange(1,1,1,Math.max(1,sh.getLastColumn())).getValues()[0].map(function(h){ return String(h).trim(); });
}
function rowFromObj(headers, obj){
  return headers.map(function(h){ return (h in obj) ? obj[h] : ""; });
}
function findRow(sh, keyField, key){
  var headers = headersOf(sh);
  var col = headers.indexOf(keyField);
  if(col < 0) return -1;
  var last = sh.getLastRow();
  if(last < 2) return -1;
  var colVals = sh.getRange(2, col+1, last-1, 1).getValues();
  for(var i=0;i<colVals.length;i++){
    if(String(colVals[i][0]) === String(key)) return i + 2; // fila real
  }
  return -1;
}
function upsertRow(ss, name, keyField, key, obj){
  var sh = sheet(ss, name);
  if(!sh) throw new Error("hoja no encontrada: " + name);
  var headers = headersOf(sh);
  var row = findRow(sh, keyField, key);
  if(row > 0){
    sh.getRange(row, 1, 1, headers.length).setValues([rowFromObj(headers, obj)]);
    return "fila actualizada (" + key + ")";
  } else {
    sh.appendRow(rowFromObj(headers, obj));
    return "fila nueva (" + key + ")";
  }
}
function appendRow(ss, name, obj){
  var sh = sheet(ss, name);
  if(!sh) throw new Error("hoja no encontrada: " + name);
  sh.appendRow(rowFromObj(headersOf(sh), obj));
}
function setRowByIndex(ss, name, index, obj){
  var sh = sheet(ss, name);
  if(!sh) throw new Error("hoja no encontrada: " + name);
  var headers = headersOf(sh);
  var row = Number(index) + 2; // index 0 = primera fila de datos
  if(row > sh.getLastRow()){ sh.appendRow(rowFromObj(headers, obj)); return; }
  sh.getRange(row, 1, 1, headers.length).setValues([rowFromObj(headers, obj)]);
}
function deleteRow(ss, name, keyField, key){
  var sh = sheet(ss, name);
  if(!sh) throw new Error("hoja no encontrada: " + name);
  var row = findRow(sh, keyField, key);
  if(row > 0){ sh.deleteRow(row); return "fila eliminada (" + key + ")"; }
  return "no se encontro (" + key + ")";
}
function delRowByIndex(ss, name, index){
  var sh = sheet(ss, name);
  if(!sh) throw new Error("hoja no encontrada: " + name);
  var row = Number(index) + 2;
  if(row <= sh.getLastRow()) sh.deleteRow(row);
}

/* --- escritura campo/valor (Concepto, Meta) --- */
function setKV(ss, name, pairs){
  var sh = sheet(ss, name);
  if(!sh) throw new Error("hoja no encontrada: " + name);
  var values = sh.getDataRange().getValues();
  for(var k in pairs){
    if(!Object.prototype.hasOwnProperty.call(pairs, k)) continue;
    var found = false;
    for(var r=0; r<values.length; r++){
      if(String(values[r][0]).trim() === k){ sh.getRange(r+1, 2).setValue(pairs[k]); found = true; break; }
    }
    if(!found) sh.appendRow([k, pairs[k]]);
  }
}

/* --- reescribe una lista completa (Pilares, Paleta, Materiales, Mood) --- */
function replaceList(ss, name, header, rows){
  var sh = sheet(ss, name);
  if(!sh){ sh = ss.insertSheet(name); }
  var last = sh.getLastRow();
  if(last > 1) sh.getRange(2, 1, last-1, Math.max(1, sh.getLastColumn())).clearContent();
  if(header && header.length) sh.getRange(1, 1, 1, header.length).setValues([header]);
  if(rows && rows.length) sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/* --- bitacora --- */
function logHistory(ss, tab, key, action, note){
  var sh = sheet(ss, "Historial");
  if(!sh){
    sh = ss.insertSheet("Historial");
    sh.appendRow(["when","tab","key","action","note"]);
  }
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "America/Hermosillo", "yyyy-MM-dd HH:mm");
  sh.appendRow([stamp, tab, key, action, note]);
}
