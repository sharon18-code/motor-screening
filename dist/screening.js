/*!
 * Motor de Screening CCB v1.0
 * Cruce de personas y empresas contra listas restrictivas abiertas
 * (ONU, OFAC, UE, Procuraduría SIRI, SECOP I/II, SIC, INVIMA, JCC)
 * e informe imprimible.
 *
 * Uso en Webflow (Code Embed):
 *   <div id="ccb-screening"></div>
 *   <script src="https://cdn.jsdelivr.net/gh/USUARIO/REPO@main/dist/screening.js"
 *           data-lists="https://cdn.jsdelivr.net/gh/USUARIO/REPO@main/data/listas.json"></script>
 *
 * No guarda consultas: todo ocurre en el navegador de quien consulta.
 */
(function (root) {
  "use strict";

  // ============================================================ configuración
  // Logo DataStore CCB por defecto (se puede reemplazar con data-logo)
  var DEFAULT_LOGO = "data:image/png;base64,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";
  var script = (typeof document !== "undefined" && document.currentScript) || null;
  var attr = function (k, d) { return (script && script.getAttribute(k)) || d; };
  var CONFIG = {
    target: attr("data-target", "ccb-screening"),
    listsUrl: attr("data-lists", ""),
    appToken: attr("data-app-token", ""),           // token gratuito de datos.gov.co (opcional)
    logoUrl: attr("data-logo", "") || DEFAULT_LOGO,
    brand: attr("data-brand", "Cámara de Comercio de Bogotá"),
    product: attr("data-product", "Informe de verificación en listas restrictivas"),
    primary: attr("data-color", "#14213D"),
    accent: attr("data-accent", "#08A2B7"),
    threshold: 0.9,
    socrata: "https://www.datos.gov.co/resource/",
  };

  // ============================================================ normalización
  // Debe coincidir con norm_name() de scripts/build_lists.py
  var LEGAL = {};
  ("SAS SA LTDA LIMITADA EU SCA SC BIC CIA Y INC LLC LTD CORP CO SRL SPA GMBH AG PLC DE DEL LA LAS LOS EL")
    .split(" ").forEach(function (t) { LEGAL[t] = 1; });

  function stripAccents(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  function normName(s) {
    if (!s) return "";
    s = stripAccents(String(s)).toUpperCase();
    s = s.replace(/S\.\s*A\.\s*S\.?/g, " SAS ");
    s = s.replace(/\bS\.\s*A\.?(?=\s|$|,)/g, " SA ");
    s = s.replace(/[^A-Z0-9]+/g, " ");
    return s.split(" ").filter(function (t) { return t && !LEGAL[t]; }).join(" ");
  }

  function onlyDigits(s) { return String(s || "").replace(/[^0-9]/g, ""); }

  // Dígito de verificación DIAN para NIT
  function nitDV(nit) {
    var w = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    var d = onlyDigits(nit), sum = 0;
    for (var i = 0; i < d.length; i++) sum += parseInt(d.charAt(d.length - 1 - i), 10) * w[i];
    var r = sum % 11;
    return r > 1 ? 11 - r : r;
  }

  // Variantes de un documento para cruzar: con y sin dígito de verificación
  function docVariants(tipo, num) {
    var raw = stripAccents(String(num || "")).toUpperCase().trim();
    var base = raw.replace(/[^A-Z0-9]/g, "");
    var out = {};
    if (!base) return { base: "", all: [] };
    if (tipo === "NIT") {
      var m = raw.match(/^([0-9.\s]+)-\s*([0-9])$/);
      var sinDv = m ? onlyDigits(m[1]) : (base.length === 10 && Number(base.slice(-1)) === nitDV(base.slice(0, 9)) ? base.slice(0, 9) : base);
      out[sinDv] = 1;
      out[sinDv + nitDV(sinDv)] = 1;
      base = sinDv;
    } else {
      out[base] = 1;
    }
    return { base: base, all: Object.keys(out) };
  }

  // ============================================================ similitud
  function jaroWinkler(a, b) {
    if (a === b) return 1;
    if (!a || !b) return 0;
    var md = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
    var am = new Array(a.length), bm = new Array(b.length), m = 0, t = 0, i, j;
    for (i = 0; i < a.length; i++) {
      for (j = Math.max(0, i - md); j < Math.min(b.length, i + md + 1); j++) {
        if (!bm[j] && a[i] === b[j]) { am[i] = bm[j] = true; m++; break; }
      }
    }
    if (!m) return 0;
    for (i = 0, j = 0; i < a.length; i++) {
      if (!am[i]) continue;
      while (!bm[j]) j++;
      if (a[i] !== b[j]) t++;
      j++;
    }
    var jaro = (m / a.length + m / b.length + (m - t / 2) / m) / 3;
    var p = 0;
    while (p < 4 && a[p] && a[p] === b[p]) p++;
    return jaro + p * 0.1 * (1 - jaro);
  }

  function coverage(ta, tb) {
    var hit = 0;
    ta.forEach(function (x) {
      for (var k = 0; k < tb.length; k++) { if (jaroWinkler(x, tb[k]) >= 0.92) { hit++; break; } }
    });
    return ta.length ? hit / ta.length : 0;
  }

  // Similitud entre dos nombres YA normalizados (0..1)
  function nameScore(qa, cb) {
    if (!qa || !cb) return 0;
    if (qa === cb) return 1;
    var ta = qa.split(" "), tb = cb.split(" ");
    var sa = ta.slice().sort().join(" "), sb = tb.slice().sort().join(" ");
    if (sa === sb) return 1;
    // Nombres de una sola palabra solo cuentan si son idénticos
    if (ta.length < 2 || tb.length < 2) return 0;
    var s1 = jaroWinkler(sa, sb);
    var ca = coverage(ta, tb), cb2 = coverage(tb, ta);
    var s2 = (ca + cb2) / 2;
    var s3 = ca === 1 ? 0.9 + 0.1 * cb2 : 0;
    return Math.max(s1, s2, s3);
  }

  // ============================================================ reglas de riesgo
  var LEVELS = ["Sin alertas", "Informativo", "Bajo", "Medio", "Medio-alto", "Alto"];
  var SEV_RANK = { "Crítica": 4, "Alta": 3, "Media": 2, "Baja": 1 };

  // Matriz severidad × confianza (sección 4 de la ficha de producto)
  function resultLevel(sev, conf) {
    var M = {
      "Crítica": { "Confirmado": "Alto", "Probable": "Alto", "Posible homónimo": "Medio-alto" },
      "Alta": { "Confirmado": "Alto", "Probable": "Medio-alto", "Posible homónimo": "Medio" },
      "Media": { "Confirmado": "Medio", "Probable": "Medio", "Posible homónimo": "Bajo" },
      "Baja": { "Confirmado": "Bajo", "Probable": "Bajo", "Posible homónimo": "Informativo" },
    };
    return (M[sev] && M[sev][conf]) || "Informativo";
  }

  function classify(q, cand) {
    // cand: {docs:[], names:[norm], tipo:'P'|'E', nac:''}
    var docHit = cand.docs && cand.docs.some(function (d) { return q.docs.indexOf(d) >= 0; });
    if (docHit) return { conf: "Confirmado", score: 1, motivo: "Documento idéntico" };
    var best = 0;
    (cand.names || []).forEach(function (n) { best = Math.max(best, nameScore(q.name, n)); });
    if (best < CONFIG.threshold) return null;
    // Nombre idéntico (100 %) cuenta como coincidencia; cualquier similitud menor es homónimo (máximo 99 %)
    var sk = function (n) { return n.split(" ").sort().join(" "); };
    var exact = (cand.names || []).some(function (n) { return sk(n) === sk(q.name); });
    if (exact) return { conf: "Probable", score: 1, motivo: "Nombre idéntico" };
    return { conf: "Posible homónimo", score: Math.min(best, 0.99), motivo: "Similitud de nombre " + Math.round(Math.min(best, 0.99) * 100) + " %" };
  }

  // ============================================================ fuentes
  var SOURCES = {
    ONU: { nombre: "Lista Consolidada ONU", entidad: "Consejo de Seguridad de las Naciones Unidas", sev: "Crítica", intl: true },
    // Listas vinculantes de terrorismo: se extraen de las listas OFAC y UE descargadas a diario
    EEUU_TERR: { nombre: "Listas de terroristas de EE. UU. (FTO y SDGT)", entidad: "Departamento de Estado y Departamento del Tesoro de EE. UU.", sev: "Crítica", intl: true, base: "OFAC_SDN" },
    UE_TERR_ORG: { nombre: "Lista UE de organizaciones terroristas", entidad: "Consejo de la Unión Europea", sev: "Crítica", intl: true, base: "UE" },
    UE_TERR_PER: { nombre: "Lista UE de personas catalogadas como terroristas", entidad: "Consejo de la Unión Europea", sev: "Crítica", intl: true, base: "UE" },
    OFAC_SDN: { nombre: "OFAC SDN (Lista Clinton)", entidad: "Departamento del Tesoro de EE. UU.", sev: "Alta", intl: true },
    OFAC_CONS: { nombre: "OFAC lista consolidada (no SDN)", entidad: "Departamento del Tesoro de EE. UU.", sev: "Media", intl: true },
    UE: { nombre: "Sanciones financieras UE", entidad: "Comisión Europea", sev: "Alta", intl: true },
    SIRI: { nombre: "Antecedentes SIRI", entidad: "Procuraduría General de la Nación", id: "iaeu-rcn6", url: "https://www.datos.gov.co/d/iaeu-rcn6" },
    SECOP1: { nombre: "Multas y sanciones SECOP I", entidad: "Colombia Compra Eficiente", id: "4n4q-k399", url: "https://www.datos.gov.co/d/4n4q-k399" },
    SECOP2: { nombre: "Multas y sanciones SECOP II", entidad: "Colombia Compra Eficiente", id: "it5q-hg94", url: "https://www.datos.gov.co/d/it5q-hg94" },
    SIC: { nombre: "Sanciones en firme SIC (consumidor)", entidad: "Superintendencia de Industria y Comercio", id: "73dx-n59j", url: "https://www.datos.gov.co/d/73dx-n59j", sev: "Baja" },
    INVIMA: { nombre: "Sancionatorios ejecutoriados INVIMA", entidad: "INVIMA", id: "rq4n-pzga", url: "https://www.datos.gov.co/d/rq4n-pzga", sev: "Baja" },
    JCC: { nombre: "Sanciones a contadores", entidad: "Junta Central de Contadores", id: "fs36-azrv", url: "https://www.datos.gov.co/d/fs36-azrv", sev: "Baja", soloPersonas: true },
  };

  // Grupos de listas. El color NO identifica el grupo: solo el resultado lleva color de riesgo.
  var GROUPS = [
    { key: "VINC", nombre: "Listas vinculantes para Colombia", corto: "Vinculantes Colombia", tag: "Vinculante", fuentes: ["ONU", "EEUU_TERR", "UE_TERR_ORG", "UE_TERR_PER"],
      nota: "Los hallazgos relacionados con listas vinculantes para Colombia requieren verificación y análisis conforme a la normativa aplicable. Cuando se configuren los supuestos legales correspondientes, deberán adelantarse las actuaciones y comunicaciones exigidas ante las autoridades competentes." },
    { key: "INTL", nombre: "Sanciones internacionales", corto: "Sanciones internacionales", tag: "Incluye Lista Clinton", fuentes: ["OFAC_SDN", "OFAC_CONS", "UE"],
      nota: "Los registros de terrorismo de OFAC (FTO y SDGT) y de la Unión Europea se presentan en el grupo de listas vinculantes." },
    { key: "DISC", nombre: "Antecedentes disciplinarios y de inhabilidades", corto: "Antecedentes", fuentes: ["SIRI"] },
    { key: "ADMIN", nombre: "Sanciones administrativas y contractuales", corto: "Administrativas y contractuales", fuentes: ["SECOP1", "SECOP2", "SIC", "INVIMA", "JCC"] },
  ];
  var PRIO = { "Confirmado": 1, "Probable": 2, "Posible homónimo": 3 };
  // Estado del hallazgo: Identificada (documento, o nombre idéntico con dato adicional) u Homónimo al X %
  function isHom(x) { return x.conf === "Posible homónimo"; }
  function hitEstado(x) { return isHom(x) ? { t: "Homónimo al " + Math.round(x.score * 100) + " %", c: "hom" } : { t: "Identificada", c: "id" }; }
  var PRIO_TXT = { 1: "Documento coincidente", 2: "Nombre coincidente y dato adicional", 3: "Similitud de nombre" };
  var PRIO_CORTO = PRIO_TXT;
  // Estados de verificación del hallazgo (no son niveles de riesgo)
  var ESTADO = {
    "automática": { t: "Identificada", c: "id", o: 2 },
    "pendiente": { t: "Pendiente de revisión", c: "pe", o: 3 },
    "confirmado": { t: "Verificada", c: "ve", o: 1 },
    "no concluyente": { t: "No concluyente", c: "nc", o: 4 },
    "descartado": { t: "Descartada", c: "de", o: 5 },
  };

  function pick(h, keys) {
    for (var i = 0; i < h.detalle.length; i++) {
      var d = h.detalle[i];
      if (keys.indexOf(d[0]) >= 0 && d[1] && String(d[1]).trim()) return String(d[1]).trim();
    }
    return "";
  }
  var USED = ["Documento", "Identificación", "Documentos en lista", "Sanción", "Tipo de sanción", "Programa", "Conducta", "Firmeza", "Fecha", "Efectos desde", "Incluido desde", "Desde"];
  function hitSummary(h) {
    return {
      id: pick(h, ["Documento", "Identificación", "Documentos en lista"]) || "—",
      delito: pick(h, ["Sanción", "Tipo de sanción", "Programa", "Conducta"]) || "—",
      fecha: isoToDMY(pick(h, ["Firmeza", "Fecha", "Efectos desde", "Incluido desde", "Desde"])) || "—",
      resto: h.detalle.filter(function (d) { return d[1] && String(d[1]).trim() && USED.indexOf(d[0]) < 0; }),
    };
  }
  function effLevel(h) { return h.revision === "confirmado" ? resultLevel(h.sev, "Confirmado") : h.nivel; }

  function soqlStr(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }

  var jsonpSeq = 0;
  function jsonp(url) {
    return new Promise(function (res, rej) {
      var cb = "__ccbjp" + (++jsonpSeq) + Date.now();
      var s = document.createElement("script");
      var to = setTimeout(function () { cleanup(); rej(new Error("tiempo agotado")); }, 20000);
      function cleanup() { clearTimeout(to); delete window[cb]; s.remove(); }
      window[cb] = function (d) { cleanup(); res(d); };
      s.onerror = function () { cleanup(); rej(new Error("error de red")); };
      s.src = url + (url.indexOf("?") > 0 ? "&" : "?") + "$jsonp=" + cb;
      document.head.appendChild(s);
    });
  }

  function socrata(id, params) {
    var qs = Object.keys(params).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); }).join("&");
    var url = CONFIG.socrata + id + ".json?" + qs;
    var headers = CONFIG.appToken ? { "X-App-Token": CONFIG.appToken } : {};
    return fetch(url, { headers: headers })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .catch(function () { return jsonp(url); });
  }

  // Ejecuta consultas por documento y por nombre y une resultados sin duplicar
  function both(id, docWhere, nameQ, limit) {
    var calls = [];
    if (docWhere) calls.push(socrata(id, { $where: docWhere, $limit: 200 }));
    if (nameQ) calls.push(socrata(id, { $q: nameQ, $limit: limit || 100 }));
    return Promise.all(calls).then(function (rs) {
      var seen = {}, out = [];
      rs.forEach(function (rows) {
        (rows || []).forEach(function (r) { var k = JSON.stringify(r); if (!seen[k]) { seen[k] = 1; out.push(r); } });
      });
      return out;
    });
  }

  function parseDMY(s) {
    if (!s) return null;
    var m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    var d = new Date(s);
    return isNaN(d) ? null : d;
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function fmtDate(d) { return d && !isNaN(d) ? pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear() : "—"; }
  function fmtDateTime(d) { return d && !isNaN(d) ? fmtDate(d) + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) : "—"; }
  function isoToDMY(v) { var m = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : v; }
  var COP = typeof Intl !== "undefined" ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }) : null;
  function fmtCOP(v) { var n = Number(v); return isFinite(n) && n > 0 && COP ? COP.format(n) : (v || "—"); }

  var ADAPTERS = {
    SIRI: function (q) {
      var where = q.dv.base ? "numero_identificacion like " + soqlStr(q.dv.base + "%") : null;
      return both("iaeu-rcn6", where, q.tipo === "P" ? q.rawName : null).then(function (rows) {
        return rows.map(function (r) {
          var nombre = [r.primer_nombre, r.segundo_nombre, r.primer_apellido, r.segundo_apellido].filter(Boolean).join(" ");
          var desde = parseDMY(r.fecha_efectos_juridicos);
          var hasta = null;
          var y = +r.duracion_anos || 0, mo = +r.duracion_mes || 0, dd = +r.duracion_dias || 0;
          if (desde && (y || mo || dd)) { hasta = new Date(desde); hasta.setFullYear(hasta.getFullYear() + y); hasta.setMonth(hasta.getMonth() + mo); hasta.setDate(hasta.getDate() + dd); }
          var vigente = hasta ? hasta > new Date() : false;
          return {
            cand: { docs: [onlyDigits(r.numero_identificacion)], names: [normName(nombre)], tipo: "P" },
            sev: vigente ? "Alta" : "Media",
            situacion: hasta ? (vigente ? "Vigente" : "Vencida") : "No determinada",
            titulo: nombre,
            detalle: [
              ["Documento", (r.nombre_tipo_identificacion || "") + " " + String(r.numero_identificacion || "").trim()],
              ["Sanción", r.sanciones], ["Tipo", r.tipo_inhabilidad], ["Cargo", r.cargo], ["Entidad", r.entidad_sancionado],
              ["Autoridad", r.autoridad], ["Efectos desde", fmtDate(desde)],
              ["Hasta", hasta ? fmtDate(hasta) : "Duración no informada"],
              ["N.º SIRI", r.numero_siri],
            ],
          };
        });
      });
    },
    SECOP1: function (q) {
      var where = q.dv.base ? "documento_contratista like " + soqlStr(q.dv.base + "%") : null;
      return both("4n4q-k399", where, q.rawName).then(function (rows) {
        return rows.map(function (r) {
          return {
            cand: { docs: [onlyDigits(r.documento_contratista)], names: [normName(r.nombre_contratista)], tipo: q.tipo },
            fecha: parseDMY(r.fecha_de_firmeza),
            titulo: r.nombre_contratista,
            detalle: [["Documento", r.documento_contratista], ["Sanción", "Multa por incumplimiento contractual"], ["Entidad", r.nombre_entidad], ["Contrato", r.numero_de_contrato],
              ["Resolución", r.numero_de_resolucion], ["Valor", fmtCOP(r.valor_sancion)], ["Firmeza", fmtDate(parseDMY(r.fecha_de_firmeza))]],
            link: r.ruta_de_proceso,
          };
        });
      });
    },
    SECOP2: function (q) {
      return both("it5q-hg94", null, q.rawName).then(function (rows) {
        return rows.map(function (r) {
          return {
            cand: { docs: [], names: [normName(r.nombre_proveedor_objeto_de)], tipo: q.tipo },
            fecha: parseDMY(r.fecha_evento),
            titulo: r.nombre_proveedor_objeto_de,
            detalle: [["Entidad", r.nombre_entidad_creadora], ["Tipo de sanción", r.tipo_de_sancion], ["Acto", r.numero_de_acto],
              ["Valor", fmtCOP(r.valor)], ["Fecha", fmtDate(parseDMY(r.fecha_evento))], ["Estado", r.estado], ["Proceso", r.id_proceso]],
          };
        });
      });
    },
    SIC: function (q) {
      return both("73dx-n59j", null, q.rawName).then(function (rows) {
        return rows.map(function (r) {
          return {
            cand: { docs: [], names: [normName(r.multado)], tipo: q.tipo },
            titulo: r.multado,
            detalle: [["Conducta", r.conducta], ["Sector", r.sector], ["Resolución", r.res_sancion], ["Valor", fmtCOP(r.valor)],
              ["Fecha", fmtDate(parseDMY(r.fecha_emitida))], ["Radicado", r.radicado]],
          };
        });
      });
    },
    INVIMA: function (q) {
      var where = q.dv.base ? "identificaci_n like " + soqlStr(q.dv.base + "%") : null;
      return both("rq4n-pzga", where, q.rawName).then(function (rows) {
        return rows.map(function (r) {
          var inf = r.presunto_infractor || "";
          return {
            cand: { docs: [onlyDigits(r.identificaci_n)], names: [normName(inf), normName(inf.split(" - ")[0])], tipo: q.tipo },
            titulo: inf,
            detalle: [["Identificación", r.identificaci_n], ["Sanción", r.sancion], ["Producto", r.producto],
              ["Motivo", r.motivo_sancion_naturaleza], ["Firmeza", fmtDate(parseDMY(r.fecha_firmeza))], ["Proceso", r.numero_proceso]],
          };
        });
      });
    },
    JCC: function (q) {
      if (q.tipo !== "P") return Promise.resolve([]);
      var where = q.dv.base ? "c_dula like " + soqlStr(q.dv.base + "%") : null;
      return both("fs36-azrv", where, q.rawName).then(function (rows) {
        return rows.map(function (r) {
          var fin = parseDMY(r.fecha_fin);
          return {
            cand: { docs: [onlyDigits(r.c_dula)], names: [normName(r.contador)], tipo: "P" },
            situacion: fin ? (fin > new Date() ? "Vigente" : "Vencida") : "No determinada",
            titulo: r.contador,
            detalle: [["Sanción", r.tipo], ["Proceso", r.proceso_jur_dico], ["Resolución", r.resoluci_n],
              ["Desde", fmtDate(parseDMY(r.fecha_inicio))], ["Hasta", fmtDate(parseDMY(r.fecha_fin))], ["Meses", r.meses]],
          };
        });
      });
    },
  };

  // ============================================================ listas internacionales
  var listsPromise = null;
  function loadLists() {
    if (!listsPromise) {
      if (!CONFIG.listsUrl) return Promise.reject(new Error("Falta data-lists con la URL de listas.json"));
      listsPromise = fetch(CONFIG.listsUrl).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).then(function (d) {
        // Índice por documento y por primera letra de cada token para acelerar
        d.byDoc = {};
        d.e.forEach(function (row, i) { (row[4] || []).forEach(function (doc) { (d.byDoc[doc] = d.byDoc[doc] || []).push(i); }); });
        return d;
      });
      listsPromise.catch(function () { listsPromise = null; });
    }
    return listsPromise;
  }

  function screenInternational(q, lists) {
    var hits = {};
    var qTok = q.name ? q.name.split(" ") : [];
    var pref = {};
    qTok.forEach(function (t) { pref[t.slice(0, 2)] = 1; });
    var docIdx = {};
    q.dv.all.forEach(function (d) { (lists.byDoc[d] || []).forEach(function (i) { docIdx[i] = 1; }); });

    lists.e.forEach(function (row, i) {
      var src = row[0], prog = (row[5] && row[5].prog) || "";
      // Terroristas de EE. UU. (FTO/SDGT en OFAC SDN) y de la UE (Posición Común 2001/931, programa TERR) van a su propia lista vinculante
      if (src === "OFAC_SDN" && /\b(FTO|SDGT|SDT)\b/.test(prog)) src = "EEUU_TERR";
      else if (src === "UE" && prog === "TERR") src = row[1] === "P" ? "UE_TERR_PER" : "UE_TERR_ORG";
      if (!SOURCES[src]) return;
      var names = row[3] || [];
      if (!docIdx[i]) {
        // Prefiltro barato: algún token del candidato comparte las dos primeras letras
        var ok = names.some(function (n) { return n.split(" ").some(function (t) { return pref[t.slice(0, 2)]; }); });
        if (!ok) return;
      }
      var extra = row[5] || {};
      var c = classify(q, { docs: row[4], names: names, tipo: row[1] === "O" ? "E" : row[1], nac: extra.nac });
      if (!c) return;
      (hits[src] = hits[src] || []).push({
        conf: c.conf, score: c.score, motivo: c.motivo, sev: SOURCES[src].sev, situacion: "Vigente en la lista",
        titulo: row[2],
        detalle: [["Tipo", row[1] === "P" ? "Persona" : row[1] === "O" ? "Buque o aeronave" : "Entidad"], ["Origen", src !== row[0] ? (row[0] === "OFAC_SDN" ? "Publicada en OFAC SDN" : "Publicada en la lista consolidada UE") : ""],
          ["Programa", String(extra.prog || "").replace(/^\[|\]$/g, "").replace(/\]\s*\[/g, " · ")], ["Referencia", extra.ref], ["Nacimiento", extra.nac], ["Nacionalidad", extra.pais],
          ["Incluido desde", extra.desde], ["Documentos en lista", (row[4] || []).join(", ")], ["Alias", names.slice(1, 6).join(" · ")]],
      });
    });
    return hits;
  }

  // ============================================================ orquestación
  function runScreening(input, onUpdate) {
    var notify = function (k) { if (onUpdate) try { onUpdate(k, results[k]); } catch (e) { } };
    var tipoSujeto = input.tipoDoc === "NIT" ? "E" : "P";
    var q = {
      tipoDoc: input.tipoDoc, numDoc: input.numDoc, rawName: input.nombre.trim(),
      name: normName(input.nombre), tipo: tipoSujeto, nac: (input.nac || "").trim(),
      dv: docVariants(input.tipoDoc, input.numDoc),
    };
    q.docs = q.dv.all;
    var started = new Date();
    var results = {};
    Object.keys(SOURCES).forEach(function (k) { results[k] = { estado: "pendiente", hits: [] }; });

    var tasks = [];
    tasks.push(loadLists().then(function (lists) {
      var h = screenInternational(q, lists);
      Object.keys(SOURCES).forEach(function (k) {
        if (!SOURCES[k].intl) return;
        var f = lists.fuentes[SOURCES[k].base || k] || {};
        results[k] = { estado: f.estado === "ok" ? "ok" : (f.estado || "no disponible"), corte: f.fecha, registros: f.registros, hits: h[k] || [] };
        notify(k);
      });
    }).catch(function (e) {
      Object.keys(SOURCES).forEach(function (k) { if (SOURCES[k].intl) { results[k] = { estado: "error", error: e.message, hits: [] }; notify(k); } });
    }));

    Object.keys(ADAPTERS).forEach(function (k) {
      if (SOURCES[k].soloPersonas && q.tipo !== "P") { results[k] = { estado: "no aplica", hits: [] }; setTimeout(function () { notify(k); }, 0); return; }
      tasks.push(ADAPTERS[k](q).then(function (rows) {
        var hits = [];
        rows.forEach(function (r) {
          var c = classify(q, r.cand);
          if (!c) return;
          hits.push({ conf: c.conf, score: c.score, motivo: c.motivo, sev: r.sev || SOURCES[k].sev, titulo: r.titulo, detalle: r.detalle, link: r.link, fecha: r.fecha, situacion: r.situacion || "No determinada" });
        });
        if (k === "SECOP1" || k === "SECOP2") {
          var tres = new Date(); tres.setFullYear(tres.getFullYear() - 3);
          var reciente = hits.some(function (h) { return h.fecha && h.fecha > tres; });
          var sev = hits.length >= 2 || reciente ? "Media" : "Baja";
          hits.forEach(function (h) { h.sev = sev; });
        }
        results[k] = { estado: "ok", corte: new Date().toISOString(), hits: hits };
        notify(k);
      }).catch(function (e) { results[k] = { estado: "error", error: e.message, hits: [] }; notify(k); }));
    });

    return Promise.all(tasks).then(function () {
      Object.keys(results).forEach(function (k) {
        results[k].hits.sort(function (a, b) { return b.score - a.score; });
        results[k].hits.forEach(function (h, i) {
          h.id = k + "-" + i;
          h.nivel = resultLevel(h.sev, h.conf);
          h.revision = h.conf === "Confirmado" ? "automática" : "pendiente";
        });
      });
      return { q: q, input: input, inicio: started, fin: new Date(), results: results, id: consultaId() };
    });
  }

  function consultaId() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return "CCB-" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  // Nivel global considerando revisión humana y fuentes manuales
  function globalLevel(run, manual) {
    var rank = 0, pend = 0;
    Object.keys(run.results).forEach(function (k) {
      run.results[k].hits.forEach(function (h) {
        if (h.revision === "descartado") return;
        if (h.revision === "pendiente" && h.conf !== "Confirmado") pend++;
        var lvl = h.revision === "confirmado" ? resultLevel(h.sev, "Confirmado") : h.nivel;
        rank = Math.max(rank, LEVELS.indexOf(lvl));
      });
    });
    (manual || []).forEach(function (m) {
      if (m.estado === "hallazgo") rank = Math.max(rank, LEVELS.indexOf(resultLevel(m.sev || "Media", "Confirmado")));
    });
    return { nivel: LEVELS[rank], pendientes: pend };
  }

  // ============================================================ UI
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }


  var CSS = [
    ":host{all:initial;display:block;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif;color:#14213D;font-size:14px;line-height:1.45;--p:" + CONFIG.primary + ";--a:" + CONFIG.accent + ";--adk:#096F7D;--ink:#252525;--mut:#5B6B7F;--line:#E1E8EF;--panel:#F7F7F7}",
    "*{box-sizing:border-box}button{font-family:inherit}",
    ".app{max-width:1120px;margin:0 auto}",
    // encabezado
    ".top{background:var(--p);color:#fff;border-radius:16px 16px 0 0;padding:20px 24px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;position:relative;overflow:hidden}",
    ".top:after{content:'';position:absolute;right:-60px;top:-80px;width:260px;height:260px;border-radius:50%;border:40px solid rgba(8,162,183,.18)}",
    ".logo{background:#fff;border-radius:10px;padding:8px 12px;display:flex}.logo img{height:30px;display:block}",
    ".top h1{margin:0;font-size:20px;font-weight:800;letter-spacing:-.01em}.top p{margin:2px 0 0;font-size:13px;color:#B9C8D6}",
    ".top .meta{margin-left:auto;font-size:12px;color:#B9C8D6;text-align:right;position:relative;z-index:1}.top .meta b{color:#fff;font-weight:600}",
    ".srcs{background:#1C2D52;color:#B9C8D6;font-size:12px;padding:9px 24px;display:flex;gap:6px 14px;flex-wrap:wrap}.srcs span:before{content:'●';color:var(--a);margin-right:6px;font-size:9px;vertical-align:1px}",
    // pasos
    ".steps{display:flex;background:#fff;border:1px solid var(--line);border-top:0;border-radius:0 0 16px 16px;padding:0 12px;margin-bottom:18px;overflow-x:auto}",
    ".step{flex:1;min-width:150px;display:flex;align-items:center;gap:10px;padding:14px 12px;border:0;background:none;color:var(--mut);font-size:13px;font-weight:600;cursor:default;border-bottom:3px solid transparent;text-align:left}",
    ".step i{font-style:normal;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:12px;background:#EEF2F6;color:var(--mut);flex:none}",
    ".step.on{color:var(--p);border-bottom-color:var(--a)}.step.on i{background:var(--a);color:#fff}.step.done{color:var(--adk);cursor:pointer}.step.done i{background:#E6F6F8;color:var(--adk)}",
    // tarjetas y formulario
    ".card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px;margin-bottom:16px}",
    ".card h3{margin:0 0 4px;font-size:16px;font-weight:700}.card .lead{margin:0 0 18px;color:var(--mut);font-size:13px}",
    ".seg{display:inline-flex;background:#EEF2F6;border-radius:10px;padding:4px;margin-bottom:18px}",
    ".seg button{border:0;background:none;padding:8px 16px;border-radius:7px;font-size:13px;font-weight:600;color:var(--mut);cursor:pointer}.seg button.on{background:#fff;color:var(--p);box-shadow:0 1px 3px rgba(20,33,61,.15)}",
    ".grid{display:grid;grid-template-columns:200px 1fr 2fr;gap:14px 16px}.grid .full{grid-column:1/-1}@media(max-width:820px){.grid{grid-template-columns:1fr}}",
    ".grid.two{grid-template-columns:1fr 200px}@media(max-width:820px){.grid.two{grid-template-columns:1fr}}",
    "label{display:block;font-size:12px;font-weight:600;color:#3B4A5C;margin-bottom:6px}label small{font-weight:400;color:var(--mut)}",
    "input,select{width:100%;font:inherit;font-size:14px;padding:11px 12px;border:1px solid #C9D2DE;border-radius:9px;background:#fff;color:var(--p)}",
    "input:focus,select:focus{outline:3px solid rgba(8,162,183,.25);border-color:var(--a)}input.bad{border-color:#D92D20}",
    ".hint{font-size:12px;color:var(--mut);margin-top:5px;min-height:17px}.hint b{color:var(--adk);font-weight:600}.hint.err{color:#B42318}",
    ".actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:20px;padding-top:18px;border-top:1px solid var(--line)}",
    ".btn{font-weight:700;font-size:14px;border:0;border-radius:9px;padding:12px 20px;cursor:pointer;background:var(--p);color:#fff;display:inline-flex;align-items:center;gap:8px}",
    ".btn:hover{background:#1C2D52}.btn.acc{background:var(--a)}.btn.acc:hover{background:var(--adk)}.btn.sec{background:#fff;color:var(--p);border:1px solid #C9D2DE}.btn.sec:hover{border-color:var(--p)}",
    ".btn.sm{padding:5px 10px;font-size:12px;font-weight:600;border-radius:7px}.btn:disabled{opacity:.5;cursor:default}",
    ".muted{color:var(--mut);font-size:13px}",
    // progreso
    ".prog{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;margin-top:14px}",
    ".prow{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;font-size:13px}.prow div{flex:1;min-width:0}.prow small{display:block;color:var(--mut);font-size:11.5px}",
    ".bar{height:6px;background:#EEF2F6;border-radius:9px;overflow:hidden;margin-top:12px}.bar i{display:block;height:100%;background:var(--a);transition:width .3s}",
    ".spin{width:16px;height:16px;border:2px solid #DDE4EE;border-top-color:var(--a);border-radius:50%;animation:s .9s linear infinite;flex:none}@keyframes s{to{transform:rotate(360deg)}}",
    // resumen
    ".sum{display:grid;grid-template-columns:220px 1fr;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff;margin-bottom:16px}@media(max-width:820px){.sum{grid-template-columns:1fr}}",
    ".verd{padding:20px;color:#fff;display:grid;align-content:center;gap:4px}.verd small{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;font-weight:600}.verd b{font-size:22px;font-weight:800;line-height:1.15}",
    ".sumb{padding:18px 20px}.sumb h2{margin:0;font-size:17px;font-weight:800;color:var(--ink)}.sumb .doc{font-weight:600;font-size:13px;margin-top:2px}.sumb .muted{font-size:12px;margin-top:4px}",
    ".kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:14px}@media(max-width:620px){.kpis{grid-template-columns:repeat(2,1fr)}}",
    ".kpi{border:1px solid var(--line);border-radius:10px;padding:10px 12px}.kpi small{display:block;font-size:10.5px;color:var(--mut);text-transform:uppercase;letter-spacing:.06em;font-weight:600}.kpi b{font-size:22px;font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums}",
    ".kpi.pe{border-color:#FEC84B;background:#FFFCF0}",
    ".note{display:flex;gap:10px;align-items:flex-start;background:#FFFAEB;border:1px solid #FEDF89;color:#7A4A06;border-radius:10px;padding:11px 14px;font-size:13px;margin-bottom:16px}",
    ".note.ok{background:#E6F6F8;border-color:#9DD3DB;color:var(--adk)}",
    ".legend{font-size:12px;color:var(--mut);margin:0 0 14px}",
    ".bar2{position:sticky;bottom:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;background:rgba(255,255,255,.96);backdrop-filter:blur(6px);border:1px solid var(--line);border-radius:14px;padding:12px 16px;margin-top:6px;box-shadow:0 -4px 18px rgba(20,33,61,.08)}",
    // vista previa
    ".pv{background:#E9EDF2;border-radius:14px;padding:22px;overflow:hidden}",
    ".pv-tool{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}",
    ".sheet{margin:0 auto;background:#fff;box-shadow:0 6px 24px rgba(20,33,61,.18);border-radius:4px;overflow:hidden;transform-origin:top left}",
    ".sheet iframe{border:0;width:816px;display:block;background:#fff}",
    ".tip{font-size:12px;color:var(--mut);margin-top:12px;text-align:center}",
    ".warn{background:#FEF3F2;border:1px solid #FECDCA;color:#B42318;border-radius:10px;padding:12px 14px;font-size:13px}",
  ].join("");

  var SHARED_CSS = [
    ".pill{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:700;border-radius:999px;padding:1px 8px;border:1px solid;white-space:nowrap;line-height:1.5}",
    ".st-id{color:#175CD3;background:#EFF8FF;border-color:#B2DDFF}.st-pe{color:#854A0E;background:#FEF0C7;border-color:#FEC84B}.st-ve{color:#096F7D;background:#E6F6F8;border-color:#9DD3DB}",
    ".st-nc{color:#5925DC;background:#F4F3FF;border-color:#D9D6FE}.st-de{color:#475467;background:#F2F4F7;border-color:#D0D5DD}",
    ".st-hom{color:#854A0E;background:#FEF0C7;border-color:#FEC84B}.rs-hom{color:#854A0E;background:#FFFCF0;border-color:#FEDF89}.rs-con{color:#14213D;background:#EAF0F5;border-color:#B9C8D6}.rs-sin{color:#475467;background:#F2F4F7;border-color:#D0D5DD}.rs-nd{color:#B54708;background:#FFFAEB;border-color:#FEDF89}",
    ".grp{border:1px solid #E1E8EF;border-radius:8px;overflow:hidden;margin:0 0 12px;background:#fff;break-inside:auto}",
    ".g-hd{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:8px 12px;background:#F7FAFC;border-bottom:1px solid #E1E8EF}",
    ".g-hd b{font-size:12.5px;color:#14213D}.g-hd em{font-style:normal;font-size:10px;font-weight:600;color:#096F7D;border:1px solid #9DD3DB;border-radius:4px;padding:0 6px;margin-left:8px;white-space:nowrap}",
    ".g-note{border-left:3px solid #08A2B7;background:#F7FAFC;padding:5px 12px;font-size:10.5px;color:#14213D}",
    ".g-src{padding:7px 12px;border-top:1px solid #EEF2F6;break-inside:avoid}.g-src:first-of-type{border-top:0}",
    ".g-src-hd{display:flex;justify-content:space-between;gap:10px;align-items:baseline;font-size:11.5px;color:#14213D}.g-ent{color:#5B6B7F;font-size:10.5px}",
    ".ptbl{width:100%;border-collapse:collapse;font-size:11px;margin-top:6px}",
    ".ptbl th{font-size:9.5px;color:#5B6B7F;background:#F7FAFC;text-transform:uppercase;letter-spacing:.05em;padding:6px 8px;border-bottom:1px solid #E1E8EF;font-weight:600;text-align:left}",
    ".ptbl td{padding:7px 8px;border-bottom:1px solid #E1E8EF;vertical-align:top;color:#14213D}.ptbl td.num{font-variant-numeric:tabular-nums;white-space:nowrap}.ptbl tr{break-inside:avoid}",
    ".det{font-size:10px;color:#5B6B7F;margin-top:2px}.det a{color:#096F7D}.dim td{opacity:.6}",
  ].join("");
  var GROUP_CSS = SHARED_CSS;

  function plural(n, s, p) { return n + " " + (n === 1 ? s : (p || s + "s")); }
  function liveHits(run, k) { return run.results[k].hits.filter(function (x) { return x.revision !== "descartado"; }); }
  function estadoPill(x) { var e = hitEstado(x); return "<span class='pill st-" + e.c + "'>" + esc(e.t) + "</span>"; }
  // Resultado agregado de una o varias fuentes: Identificada · Homónimo · Sin coincidencias · Consulta no disponible
  function aggResult(rs) {
    var id = 0, hom = 0, nd = 0, n = 0;
    rs.forEach(function (r) {
      if (r.estado === "no aplica") return; n++;
      if (r.estado !== "ok" && r.estado !== "desactualizada") { nd++; return; }
      r.hits.forEach(function (x) { if (isHom(x)) hom++; else id++; });
    });
    if (id) return { t: "Identificada (" + id + ")", c: "rs-con" };
    if (hom) return { t: "Homónimo (" + hom + ")", c: "rs-hom" };
    if (n && nd === n) return { t: "Consulta no disponible", c: "rs-nd" };
    return { t: "Sin coincidencias", c: "rs-sin" };
  }
  function sourceResult(r) {
    if (r.estado === "no aplica") return { t: "No aplica", c: "rs-sin", na: 1 };
    return aggResult([r]);
  }
  function resPill(o) { return "<span class='pill " + o.c + "'>" + esc(o.t) + "</span>"; }

  function detLine(x) {
    var sm = hitSummary(x), vals = [];
    if (sm.delito !== "—") vals.push(sm.delito);
    sm.resto.forEach(function (d) { if (d[0] !== "Tipo") vals.push(d[0] === "Alias" ? "Alias: " + d[1] : d[0] === "Hasta" ? "Hasta " + d[1] : d[1]); });
    if (sm.fecha !== "—") vals.push("Fecha: " + sm.fecha);
    var h = esc(vals.join(" · "));
    if (x.link) h += (h ? " · " : "") + "<a href='" + esc(x.link) + "' target='_blank' rel='noopener'>" + (/contratos\.gov|secop/i.test(x.link) ? "Ver en SECOP" : "Ver en la fuente") + "</a>";
    return h;
  }

  function hitsTable(rows, screen, withSource) {
    var h = "<table class='ptbl'><thead><tr>" + (withSource ? "<th>Fuente</th>" : "") + "<th>Nombre en la lista</th><th>Identificación</th><th>Situación en la fuente</th><th>Estado</th></tr></thead><tbody>";
    rows.forEach(function (r) {
      var x = r.hit, sm = hitSummary(x);
      h += "<tr>" + (withSource ? "<td><b>" + esc(SOURCES[r.k].nombre) + "</b><div class='det'>" + esc(SOURCES[r.k].entidad) + "</div></td>" : "") +
        "<td>" + esc(x.titulo) + "<div class='det'>" + detLine(x) + "</div></td><td class='num'>" + esc(sm.id) + "</td><td>" + esc(x.situacion || "No determinada") +
        "</td><td>" + estadoPill(x) + "</td></tr>";
    });
    return h + "</tbody></table>";
  }

  function sectionsHTML(state, screen) {
    var run = state.run, h = "";
    GROUPS.forEach(function (g) {
      var fu = g.fuentes.filter(function (k) { return run.results[k] && run.results[k].estado !== "no aplica"; });
      if (!fu.length) return;
      h += "<section class='grp'><div class='g-hd'><span><b>" + esc(g.nombre) + "</b>" + (g.tag ? "<em>" + esc(g.tag) + "</em>" : "") + "</span>" +
        resPill(aggResult(fu.map(function (k) { return run.results[k]; }))) + "</div>";
      if (g.nota) h += "<div class='g-note'>" + esc(g.nota) + "</div>";
      fu.forEach(function (k) {
        var r = run.results[k], s = SOURCES[k], res = sourceResult(r);
        var corte = r.corte && res.c !== "rs-nd" ? fmtDate(new Date(r.corte)) : "";
        h += "<div class='g-src'><div class='g-src-hd'><span><b>" + esc(s.nombre) + "</b> <span class='g-ent'>· " + esc(s.entidad) +
          (corte ? " · " + (s.intl ? "fecha de corte " : "consultada ") + esc(corte) : "") + (r.estado === "desactualizada" ? " · corte anterior" : "") + "</span></span>" + resPill(res) + "</div>";
        if (r.hits.length) h += hitsTable(r.hits.map(function (x) { return { k: k, hit: x }; }), screen, false);
        h += "</div>";
      });
      h += "</section>";
    });
    return h;
  }

  // Conteos del resumen. "Identificadas" es el total bruto: incluye verificadas, pendientes, no concluyentes y descartadas.
  function runStats(run) {
    var c = { ident: 0, hom: 0, ok: 0, nd: 0, noReal: 0, regs: 0 };
    Object.keys(SOURCES).forEach(function (k) {
      var r = run.results[k]; if (!r) return;
      if (r.estado === "no aplica") { c.noReal++; return; }
      if (r.estado !== "ok" && r.estado !== "desactualizada") { c.nd++; return; }
      c.ok++; c.regs += r.registros || 0;
      r.hits.forEach(function (x) { if (isHom(x)) c.hom++; else c.ident++; });
    });
    c.total = c.ident + c.hom;
    return c;
  }
  // Resultado global: Con coincidencias (hay identificadas) · Posibles homónimos · Sin coincidencias
  function verdict(st) {
    if (st.ident) return { t: "Con coincidencias", bg: "#14213D", txt: "Se identificaron coincidencias en las fuentes consultadas. Revise el detalle de cada hallazgo." };
    if (st.hom) return { t: "Posibles homónimos", bg: "#475467", txt: "Solo se encontraron nombres similares que no coinciden por documento. Pueden corresponder a otras personas." };
    return { t: "Sin coincidencias", bg: "#096F7D", txt: "No se identificaron coincidencias en las " + st.ok + " fuentes consultadas." };
  }
  var LEGEND = "Identificada: coincide el número de documento o el nombre completo de forma idéntica (100 %). Homónimo al X %: el nombre se parece en ese porcentaje, sin ser idéntico ni coincidir el documento; puede tratarse de otra persona.";

  function allFindings(run) {
    var rows = [];
    Object.keys(SOURCES).forEach(function (k) { if (run.results[k]) run.results[k].hits.forEach(function (x) { rows.push({ k: k, hit: x }); }); });
    rows.sort(function (a, b) { return (isHom(a.hit) - isHom(b.hit)) || PRIO[a.hit.conf] - PRIO[b.hit.conf] || b.hit.score - a.hit.score; });
    return rows;
  }

  function verifCode(run) {
    var str = [run.id, run.input.tipoDoc, run.input.numDoc, run.input.nombre, run.fin.toISOString()].join("|"), h1 = 0x811c9dc5, h2 = 0x01000193;
    for (var i = 0; i < str.length; i++) { h1 = Math.imul(h1 ^ str.charCodeAt(i), 16777619) >>> 0; h2 = Math.imul(h2 + str.charCodeAt(i), 2246822519) >>> 0; }
    var x = ((h1 ^ h2) >>> 0).toString(16).toUpperCase();
    while (x.length < 8) x = "0" + x;
    return x.slice(0, 4) + "-" + x.slice(4);
  }

  function fmtDocumento(tipo, num) {
    var raw = String(num || "").trim();
    if (!raw) return "Sin documento";
    var dots = function (d) { return d.replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
    var lbl = { CC: "C.C.", CE: "C.E.", PA: "Pasaporte", PEP: "PPT", NIT: "NIT" }[tipo] || tipo;
    if (tipo === "NIT") { var b = docVariants("NIT", raw).base; return "NIT " + dots(b) + "-" + nitDV(b); }
    if (tipo === "CC" || tipo === "CE") return lbl + " " + dots(onlyDigits(raw));
    return lbl + " " + raw;
  }

  var LEGAL_TXT = [
    "Este informe presenta resultados de consultas y verificaciones sobre las fuentes identificadas, conforme a sus fechas de referencia. Las coincidencias no acreditan por sí mismas conductas ilícitas ni determinan responsabilidades; su ausencia tampoco garantiza inexistencia de riesgos fuera del alcance consultado. El usuario deberá interpretar los resultados y realizar las verificaciones adicionales que correspondan. El tratamiento y circulación de datos personales deberá ajustarse a la normativa aplicable. Estas advertencias no excluyen las responsabilidades que legalmente correspondan a la Cámara de Comercio de Bogotá.",
    "Esta versión no incluye listas PEP, noticias en medios ni antecedentes penales de la Policía Nacional. La información deberá utilizarse para finalidades legítimas y de acuerdo con la normativa de protección de datos personales. Los titulares podrán ejercer sus derechos ante el responsable o encargado que corresponda, según el tratamiento y el origen de la información.",
  ];

  var DOCS_P = [["CC", "Cédula de ciudadanía"], ["CE", "Cédula de extranjería"], ["PA", "Pasaporte"], ["PEP", "PPT / PEP"]];
  var DOCS_E = [["NIT", "NIT"]];
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k) || ""; localStorage.setItem(k, v); } catch (e) { return ""; } }
  function ensureFonts() {
    try {
      if (document.querySelector("link[data-ccb-font]")) return;
      var l = document.createElement("link"); l.rel = "stylesheet"; l.setAttribute("data-ccb-font", "1");
      l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap"; document.head.appendChild(l);
    } catch (e) { }
  }
  function previewHTML(state) {
    var run = state.run;
    var extra = "@media screen{html{background:#fff}body{padding:14mm 0 0}.pb{margin-top:10px;padding-top:26px;border-top:1px dashed #C9D2DE}" +
      ".pv-foot{display:flex;justify-content:space-between;margin-top:22px;background:#08A2B7;color:#fff;font:8.5px 'IBM Plex Mono',monospace;padding:5px 14mm}}@media print{.pv-foot{display:none}}";
    var foot = "<div class='pv-foot'><span>" + esc(CONFIG.product + " · " + run.id) + "</span><span>Vista previa</span></div>";
    return reportHTML(state, false).replace("</style>", extra + "</style>").replace("</body>", foot + "</body>");
  }
  function fileTitle(run) {
    return "Informe-verificacion-listas-" + (onlyDigits(run.input.numDoc) || run.id);
  }

  function mount(el) {
    if (!el || el.__ccb) return;
    el.__ccb = 1;
    ensureFonts();
    var rootEl = el.attachShadow ? el.attachShadow({ mode: "open" }) : el;
    var state = { step: 1, persona: "P", run: null, manual: [], analista: store("ccb-analista"), input: { tipoDoc: "CC", numDoc: "", nombre: "", nac: "" } };

    rootEl.innerHTML = "<style>" + CSS + SHARED_CSS + "</style><div class='app'>" +
      "<div class='top'>" + (CONFIG.logoUrl ? "<span class='logo'><img src='" + esc(CONFIG.logoUrl) + "' alt='" + esc(CONFIG.brand) + "'></span>" : "") +
      "<div><h1>" + esc(CONFIG.product) + "</h1><p>Generador de informes · " + esc(CONFIG.brand) + "</p></div>" +
      "<div class='meta'>Listas internacionales<br><b class='corte'>cargando…</b></div></div>" +
      "<div class='srcs'><span>ONU</span><span>OFAC (Lista Clinton)</span><span>Unión Europea</span><span>Procuraduría</span><span>SECOP I y II</span><span>SIC</span><span>INVIMA</span><span>Junta Central de Contadores</span></div>" +
      "<nav class='steps'>" + [["1", "Datos del sujeto"], ["2", "Resultados"], ["3", "Informe PDF"]].map(function (s) {
        return "<button type='button' class='step' data-step='" + s[0] + "'><i>" + s[0] + "</i>" + s[1] + "</button>";
      }).join("") + "</nav>" +
      "<section class='p1'></section><section class='p2'></section><section class='p3'></section></div>";

    var app = rootEl.querySelector(".app"), p1 = app.querySelector(".p1"), p2 = app.querySelector(".p2"), p3 = app.querySelector(".p3");

    loadLists().then(function (d) {
      var f = d.fuentes && d.fuentes.ONU, fe = d.generado || (f && f.fecha);
      app.querySelector(".corte").textContent = fe ? "actualizadas " + fmtDate(new Date(fe)) : "disponibles";
    }).catch(function () { app.querySelector(".corte").textContent = "no disponibles"; });

    function setStep(n) {
      state.step = n;
      [].forEach.call(app.querySelectorAll(".step"), function (b) {
        var k = +b.getAttribute("data-step");
        b.className = "step" + (k === n ? " on" : (k < n || (state.run && k <= 3 && k !== n && state.run.done)) ? " done" : "");
      });
      p1.style.display = n === 1 ? "" : "none"; p2.style.display = n === 2 ? "" : "none"; p3.style.display = n === 3 ? "" : "none";
      if (n === 3) renderPreview();
      try { app.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { }
    }

    // ---------------------------------------------------------- paso 1
    function renderForm() {
      var isP = state.persona === "P", docs = isP ? DOCS_P : DOCS_E, inp = state.input;
      if (!docs.some(function (d) { return d[0] === inp.tipoDoc; })) inp.tipoDoc = docs[0][0];
      p1.innerHTML = "<form class='card' novalidate><h3>¿A quién vamos a consultar?</h3><p class='lead'>Ingresa los datos tal como aparecen en el documento de identidad o en el registro mercantil.</p>" +
        "<div class='seg'><button type='button' data-p='P' class='" + (isP ? "on" : "") + "'>Persona natural</button><button type='button' data-p='E' class='" + (!isP ? "on" : "") + "'>Persona jurídica</button></div>" +
        "<div class='grid'>" +
        "<div><label>Tipo de documento</label><select name='tipoDoc'>" + docs.map(function (d) { return "<option value='" + d[0] + "'" + (d[0] === inp.tipoDoc ? " selected" : "") + ">" + d[1] + "</option>"; }).join("") + "</select></div>" +
        "<div><label>Número " + (isP ? "" : "<small>(con o sin dígito de verificación)</small>") + "</label><input name='numDoc' inputmode='numeric' autocomplete='off' value='" + esc(inp.numDoc) + "' placeholder='" + (isP ? "Ej. 79779768" : "Ej. 800159998") + "'><div class='hint h-doc'></div></div>" +
        "<div><label>" + (isP ? "Nombres y apellidos" : "Razón social") + "</label><input name='nombre' autocomplete='off' value='" + esc(inp.nombre) + "' placeholder='" + (isP ? "Ej. Felipe Santiago Araujo Angulo" : "Ej. Sociedad Fiduciaria de Desarrollo Agropecuario S.A.") + "'><div class='hint h-nom'></div></div>" +
        "</div><div class='grid two' style='margin-top:6px'>" +
        "<div><label>Realizada por <small>(aparece en el informe)</small></label><input name='analista' autocomplete='name' value='" + esc(state.analista) + "' placeholder='Nombre de quien realiza la consulta'></div>" +
        (isP ? "<div><label>Año de nacimiento <small>(opcional)</small></label><input name='nac' inputmode='numeric' maxlength='4' value='" + esc(inp.nac) + "' placeholder='AAAA'><div class='hint'>Ayuda a descartar homónimos</div></div>" : "<div></div>") +
        "</div><div class='actions'><button class='btn acc' type='submit'>Consultar " + Object.keys(SOURCES).length + " fuentes →</button>" +
        "<span class='muted'>La consulta tarda unos segundos. No se guarda ningún dato de la persona consultada.</span></div></form>";
      docHint();
    }
    function docHint() {
      var f = p1.querySelector("form"); if (!f) return;
      var t = f.querySelector("[name=tipoDoc]").value, n = f.querySelector("[name=numDoc]").value.trim(), h = p1.querySelector(".h-doc");
      h.className = "hint h-doc";
      if (!n) { h.textContent = "Sin número, el cruce se hace solo por nombre."; return; }
      if ((t === "CC" || t === "NIT") && /[^0-9.\-\s]/.test(n)) { h.className += " err"; h.textContent = "Usa solo números."; return; }
      if (t === "NIT") {
        var d = onlyDigits(n);
        if (d.length === 10 && nitDV(d.slice(0, 9)) !== +d[9] && d.length !== 9) { h.className += " err"; h.innerHTML = "El dígito de verificación no coincide; se consultará como <b>" + esc(fmtDocumento(t, d.slice(0, 9))) + "</b>"; return; }
      }
      h.innerHTML = "Se consultará como <b>" + esc(fmtDocumento(t, n)) + "</b>";
    }
    p1.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-p]"); if (!b) return;
      readForm(); state.persona = b.getAttribute("data-p"); state.input.tipoDoc = state.persona === "E" ? "NIT" : "CC"; renderForm();
    });
    p1.addEventListener("input", function (ev) {
      var n = ev.target.name;
      if (n === "numDoc" || n === "tipoDoc") docHint();
      if (n === "nombre") { ev.target.classList.remove("bad"); p1.querySelector(".h-nom").textContent = ""; }
    });
    p1.addEventListener("change", function (ev) { if (ev.target.name === "tipoDoc") docHint(); });
    function readForm() {
      var f = p1.querySelector("form"); if (!f) return;
      var fv = function (n) { var e = f.querySelector("[name='" + n + "']"); return e ? e.value.trim() : ""; };
      state.input = { tipoDoc: fv("tipoDoc"), numDoc: fv("numDoc"), nombre: fv("nombre"), nac: state.persona === "P" ? fv("nac") : "" };
      state.analista = fv("analista"); store("ccb-analista", state.analista);
    }
    p1.addEventListener("submit", function (ev) {
      ev.preventDefault(); readForm();
      if (!state.input.nombre || normName(state.input.nombre).length < 3) {
        var e = p1.querySelector("[name=nombre]"); e.classList.add("bad"); e.focus();
        var h = p1.querySelector(".h-nom"); h.className = "hint h-nom err"; h.textContent = "Escribe el nombre o la razón social completa."; return;
      }
      runQuery();
    });

    // ---------------------------------------------------------- paso 2
    function runQuery() {
      state.run = null; state.manual = [];
      var keys = Object.keys(SOURCES), done = 0, inp = state.input;
      p2.innerHTML = "<div class='card'><h3>Consultando fuentes…</h3><p class='lead' style='margin-bottom:0'>" + esc(inp.nombre.toUpperCase()) + " · " + esc(fmtDocumento(inp.tipoDoc, inp.numDoc)) + "</p>" +
        "<div class='bar'><i style='width:0'></i></div><div class='prog'>" + keys.map(function (k) {
          return "<div class='prow' data-k='" + k + "'><span class='spin'></span><div><b>" + esc(SOURCES[k].nombre) + "</b><small>" + esc(SOURCES[k].entidad) + "</small></div><span class='st'></span></div>";
        }).join("") + "</div></div>";
      setStep(2);
      runScreening(inp, function (k, r) {
        var row = p2.querySelector("[data-k='" + k + "']"); if (!row || row.__d) return;
        row.__d = 1; done++;
        var sp = row.querySelector(".spin"); if (sp) sp.remove();
        row.querySelector(".st").innerHTML = resPill(sourceResult(r));
        p2.querySelector(".bar i").style.width = Math.round(done / keys.length * 100) + "%";
      }).then(function (run) { run.done = true; state.run = run; renderReview(); setStep(2); })
        .catch(function (e) { p2.innerHTML = "<div class='warn'>No se pudo completar la consulta: " + esc(e.message) + "</div><div class='actions'><button class='btn sec' data-go='new'>← Volver</button></div>"; });
    }

    function renderReview() {
      var run = state.run, st = runStats(run), v = verdict(st);
      var h = "<div class='sum'><div class='verd' style='background:" + v.bg + "'><small>Resultado de la consulta</small><b>" + v.t + "</b></div>" +
        "<div class='sumb'><h2>" + esc(run.input.nombre.toUpperCase()) + "</h2><div class='doc'>" + esc(fmtDocumento(run.input.tipoDoc, run.input.numDoc)) + "</div>" +
        "<div class='muted'>Consulta " + esc(run.id) + " · " + esc(fmtDateTime(run.fin)) + "</div>" +
        "<div class='kpis'><div class='kpi'><small>Identificadas</small><b>" + st.ident + "</b></div><div class='kpi'><small>Homónimos</small><b>" + st.hom + "</b></div>" +
        "<div class='kpi'><small>Fuentes consultadas</small><b>" + st.ok + "</b></div><div class='kpi" + (st.nd ? " pe" : "") + "'><small>No disponibles</small><b>" + st.nd + "</b></div></div></div></div>";
      if (st.nd) h += "<div class='note'>⚠ <span>" + plural(st.nd, "fuente no respondió", "fuentes no respondieron") + ". En el informe aparecerán como «Consulta no disponible». Puedes reintentar en unos minutos.</span></div>";
      else if (!st.total) h += "<div class='note ok'>✓ <span>Ninguna de las fuentes consultadas arrojó coincidencias. Puedes generar el informe.</span></div>";
      h += "<p class='legend'>" + esc(LEGEND) + "</p>";
      h += sectionsHTML(state, true);
      h += "<div class='bar2'><button class='btn sec' data-go='new'>Nueva consulta</button>" + (st.nd ? "<button class='btn sec' data-go='retry'>Reintentar consulta</button>" : "") +
        "<button class='btn acc' data-go='preview' style='margin-left:auto'>Ver informe →</button></div>";
      p2.innerHTML = h;
    }

    p2.addEventListener("click", function (ev) {
      var b = ev.target.closest("button"); if (!b) return;
      var go = b.getAttribute("data-go");
      if (go === "new") { newQuery(); return; }
      if (go === "retry") { runQuery(); return; }
      if (go === "preview") { setStep(3); return; }
    });

    // ---------------------------------------------------------- paso 3
    var ifr;
    function renderPreview() {
      if (!state.run) return;
      p3.innerHTML = "<div class='pv'><div class='pv-tool'><button class='btn sec' data-go='back'>← Volver a la revisión</button>" +
        "<div style='display:flex;gap:10px;flex-wrap:wrap'><button class='btn sec' data-go='new'>Nueva consulta</button><button class='btn acc' data-go='pdf'>⤓ Descargar PDF</button></div></div>" +
        "<div class='sheetbox'><div class='sheet'><iframe title='Vista previa del informe'></iframe></div></div>" +
        "<div class='tip'>El PDF se descarga directamente a tu computador con este mismo diseño.</div></div>";
      ifr = p3.querySelector("iframe");
      ifr.addEventListener("load", fit);
      ifr.srcdoc = previewHTML(state);
    }
    function fit() {
      if (!ifr || !ifr.contentDocument) return;
      var d = ifr.contentDocument, box = p3.querySelector(".sheetbox"), sh = p3.querySelector(".sheet");
      var hgt = Math.max(d.documentElement.scrollHeight, d.body ? d.body.scrollHeight : 0);
      ifr.style.height = hgt + "px";
      var avail = p3.querySelector(".pv").clientWidth - 44, s = Math.min(1, avail / 816);
      sh.style.width = "816px"; sh.style.transform = "scale(" + s + ")";
      box.style.width = 816 * s + "px"; box.style.height = hgt * s + "px"; box.style.margin = "0 auto";
      if (!ifr.__f) { ifr.__f = 1; try { d.fonts.ready.then(fit); } catch (e) { } setTimeout(fit, 800); }
    }
    window.addEventListener("resize", function () { if (state.step === 3) fit(); });
    p3.addEventListener("click", function (ev) {
      var b = ev.target.closest("button"); if (!b) return;
      var go = b.getAttribute("data-go");
      if (go === "back") setStep(2);
      else if (go === "new") newQuery();
      else if (go === "pdf") downloadPDF(b);
    });
    function downloadPDF(btn) {
      if (!state.run || btn.disabled) return;
      var txt = btn.innerHTML; btn.disabled = true; btn.innerHTML = "<span class='spin' style='border-top-color:#fff'></span> Generando PDF…";
      var tip = p3.querySelector(".tip");
      exportPDF(state, fileTitle(state.run)).then(function () {
        if (tip) tip.innerHTML = "✓ PDF descargado. Revisa tu carpeta de descargas.";
      }).catch(function (e) {
        if (tip) tip.innerHTML = "<span style='color:#B42318'>No se pudo generar el PDF (" + esc(e.message) + "). Intenta de nuevo o revisa tu conexión.</span>";
      }).then(function () { btn.disabled = false; btn.innerHTML = txt; });
    }

    function newQuery() {
      state.run = null; state.input = { tipoDoc: state.persona === "E" ? "NIT" : "CC", numDoc: "", nombre: "", nac: "" };
      renderForm(); p2.innerHTML = ""; p3.innerHTML = ""; setStep(1);
      var n = p1.querySelector("[name=numDoc]"); if (n) n.focus();
    }

    app.querySelector(".steps").addEventListener("click", function (ev) {
      var b = ev.target.closest(".step"); if (!b || b.className.indexOf("done") < 0) return;
      var n = +b.getAttribute("data-step");
      if (n === 1) { renderForm(); setStep(1); } else if (state.run) setStep(n);
    });

    renderForm(); setStep(1);
  }

  // ============================================================ informe
  function reportHTML(state, borrador) {
    var run = state.run, st = runStats(run), vd = verdict(st), isNat = run.input.tipoDoc !== "NIT";
    var rows = allFindings(run), code = verifCode(run);
    var doc = fmtDocumento(run.input.tipoDoc, run.input.numDoc), fecha = fmtDateTime(run.fin);
    var corteListas = run.results.ONU && run.results.ONU.corte ? fmtDate(new Date(run.results.ONU.corte)) : "—";
    var pie = (CONFIG.product + " · " + run.id).replace(/["\\]/g, "");
    var vc = vd.bg;

    var CSSR = "@page{size:letter;margin:12mm 0 14mm;" +
      "@bottom-left{content:\"" + pie + "\";font:8.5px 'IBM Plex Mono',monospace;color:#fff;background:#08A2B7;padding-left:14mm;margin-top:4mm}" +
      "@bottom-right{content:\"Página \" counter(page) \" de \" counter(pages);font:8.5px Inter,Arial,sans-serif;color:#fff;background:#08A2B7;padding-right:14mm;margin-top:4mm}}" +
      "*{box-sizing:border-box}html,body{margin:0}body{font-family:Inter,'Helvetica Neue',Helvetica,Arial,sans-serif;color:#14213D;font-size:11.5px;line-height:1.45;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
      ".pg{padding:0 14mm;display:grid;gap:14px}" +
      ".p-head{background:#F7F7F7;border-radius:12px;padding:18px 22px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center}" +
      ".p-head h1{margin:0;font-size:20px;font-weight:800;color:#252525;letter-spacing:-.01em}.p-head .doc{font-weight:700;font-size:12px}.p-head .sub{color:#5B6B7F;font-size:12px}" +
      ".idline{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:10.5px;display:flex;gap:14px;flex-wrap:wrap;margin-top:6px}.p-head img{height:34px;width:auto;mix-blend-mode:multiply}" +
      ".p-verdict{display:grid;grid-template-columns:190px 1fr;border:1px solid #DCE7EF;border-radius:10px;overflow:hidden;break-inside:avoid}" +
      ".p-verdict .lvl{background:" + vc + ";color:#fff;padding:14px 16px;display:grid;gap:2px;align-content:center}" +
      ".lvl small{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;font-weight:600}.lvl b{font-size:18px;font-weight:800;line-height:1.15}" +
      ".p-verdict .why{background:#F7FAFC;padding:12px 16px;display:grid;gap:4px}.why strong{font-size:12.5px}.why .fine{color:#5B6B7F;font-size:10.5px}" +
      ".kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.kpi{border:1px solid #E1E8EF;border-radius:8px;padding:10px 12px;display:grid;gap:2px}" +
      ".kpi small{font-size:9.5px;color:#5B6B7F;text-transform:uppercase;letter-spacing:.06em;font-weight:600}.kpi b{font-size:20px;font-weight:800;font-variant-numeric:tabular-nums;color:#252525}.kpi span{font-size:10.5px;color:#5B6B7F}" +
      ".p-h{display:flex;align-items:baseline;gap:10px;border-bottom:2px solid #08A2B7;padding-bottom:5px;margin-top:4px;break-after:avoid}.p-h h2{margin:0;font-size:13px;font-weight:700;color:#096F7D}.p-h span{font-size:10.5px;color:#5B6B7F}" +
      ".legend{font-size:9.5px;color:#5B6B7F;margin-top:-6px}" +
      ".cov{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;break-inside:avoid}.cov div{border:1px solid #E1E8EF;border-radius:6px;padding:7px 8px;display:grid;gap:4px;align-content:start;font-size:10px}.cov b{font-size:10.5px}.cov .pill{justify-self:start}.cov .m{color:#5B6B7F}" +
      ".empty{border:1px solid #D0D5DD;background:#F2F4F7;border-radius:8px;padding:8px 12px;font-size:10.5px;color:#475467}" +
      ".pid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #E1E8EF;border-radius:8px;overflow:hidden;break-inside:avoid}.pid dl{margin:0;display:grid;grid-template-columns:130px 1fr}" +
      ".pid dt,.pid dd{margin:0;padding:6px 10px;border-bottom:1px solid #E1E8EF;font-size:11px}.pid dt{color:#5B6B7F;background:#F7FAFC;font-weight:600}.pid dl:first-of-type{border-right:1px solid #E1E8EF}" +
      ".pid .ph{grid-column:1/-1;background:#EAF0F5;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:6px 10px}" +
      ".params{font-size:10px;color:#5B6B7F;margin-top:-6px}.params code{font-family:'IBM Plex Mono',monospace;color:#14213D}" +
      ".pb{break-before:page}.src td{padding:4px 8px}table.ptbl+.p-h{margin-top:14px}.disc{font-size:9.5px;color:#5B6B7F;line-height:1.5;break-inside:avoid;display:grid;gap:6px}.disc p{margin:0}" +
      ".wm{position:fixed;top:40%;left:12%;font-size:96px;color:rgba(20,33,61,.06);transform:rotate(-28deg);font-weight:800;z-index:-1}" + SHARED_CSS;

    var h = "<!doctype html><html lang='es'><head><meta charset='utf-8'><title>" + esc(CONFIG.product + " " + run.id) + "</title>" +
      "<link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap'>" +
      "<style>" + CSSR + "</style></head><body>" + (borrador ? "<div class='wm'>BORRADOR</div>" : "") + "<main class='pg'>";

    h += "<header class='p-head'><div><h1>" + esc(run.input.nombre.toUpperCase()) + "</h1><div class='doc'>" + esc(doc) + "</div><div class='sub'>" + esc(CONFIG.product) + "</div>" +
      "<div class='idline'><span>N.º " + esc(run.id) + "</span><span>" + esc(fecha) + "</span><span>Verificación: " + code + "</span></div></div>" +
      (CONFIG.logoUrl ? "<img src='" + esc(CONFIG.logoUrl) + "' alt='" + esc(CONFIG.brand) + "'>" : "<b>" + esc(CONFIG.brand) + "</b>") + "</header>";

    h += "<div class='p-verdict'><div class='lvl'><small>Resultado de la consulta</small><b>" + vd.t + "</b></div><div class='why'><strong>" + esc(vd.txt) + "</strong>" +
      (st.nd ? "<span>" + plural(st.nd, "fuente no estuvo disponible", "fuentes no estuvieron disponibles") + " al momento de la consulta; su resultado no se presenta como «sin coincidencias».</span>" : "") +
      "<span class='fine'>Las coincidencias no acreditan por sí mismas conductas ilícitas ni determinan responsabilidades.</span></div></div>";

    h += "<div class='kpis'><div class='kpi'><small>Identificadas</small><b>" + st.ident + "</b><span>Por documento o nombre idéntico</span></div>" +
      "<div class='kpi'><small>Homónimos</small><b>" + st.hom + "</b><span>Nombre similar sin confirmar</span></div>" +
      "<div class='kpi'><small>Fuentes consultadas</small><b>" + st.ok + "</b><span>Respondieron a la consulta</span></div>" +
      "<div class='kpi'><small>No disponibles</small><b>" + st.nd + "</b><span>Sin respuesta al consultar</span></div></div>";

    h += "<div class='p-h'><h2>Hallazgos</h2><span>" + (rows.length ? plural(st.ident, "identificada", "identificadas") + " · " + plural(st.hom, "homónimo", "homónimos") : "Sin coincidencias") + "</span></div>";
    h += rows.length ? hitsTable(rows, false, true) : "<div class='empty'>Ninguna de las fuentes consultadas arrojó coincidencias por documento ni por nombre para el sujeto consultado.</div>";
    h += "<div class='legend'>" + esc(LEGEND) + "</div>";

    h += "<div class='p-h'><h2>Resultados por grupo de fuentes</h2></div><div class='cov'>";
    GROUPS.forEach(function (gr) {
      var fu = gr.fuentes.filter(function (k) { return run.results[k] && run.results[k].estado !== "no aplica"; });
      if (!fu.length) return;
      var nd = fu.filter(function (k) { return sourceResult(run.results[k]).c === "rs-nd"; }).length;
      h += "<div><b>" + esc(gr.corto) + "</b>" + resPill(aggResult(fu.map(function (k) { return run.results[k]; }))) + "<span class='m'>" + plural(fu.length, "fuente", "fuentes") + (nd ? " · " + nd + " no disponible" : "") + "</span></div>";
    });
    h += "</div>";

    h += "<div class='p-h'><h2>Datos de la consulta</h2></div><div class='pid'><div class='ph'>Sujeto consultado · Consulta</div>" +
      "<dl><dt>" + (isNat ? "Nombre" : "Razón social") + "</dt><dd>" + esc(run.input.nombre) + "</dd><dt>Documento</dt><dd>" + esc(doc) + "</dd><dt>Tipo de persona</dt><dd>" + (isNat ? "Natural" : "Jurídica") + "</dd></dl>" +
      "<dl><dt>Fecha de generación</dt><dd>" + esc(fecha) + "</dd><dt>Realizada por</dt><dd>" + esc(state.analista || "Consulta automática") + "</dd><dt>Corte listas internacionales</dt><dd>" + esc(corteListas) + "</dd></dl></div>" +
      "<div class='params'>Parámetros de búsqueda: nombre normalizado <code>" + esc(run.q.name) + "</code>" + (run.q.docs && run.q.docs.length ? " · documento y variantes <code>" + esc(run.q.docs.join(", ")) + "</code>" : "") +
      (run.input.nac ? " · año de nacimiento <code>" + esc(run.input.nac) + "</code>" : "") + " · similitud de nombre desde " + Math.round(CONFIG.threshold * 100) + " %.</div>";

    h += "<div class='p-h pb'><h2>Detalle por grupo de fuentes</h2><span>Fecha de corte o de consulta de cada fuente</span></div>" + sectionsHTML(state, false);

    h += "<div class='p-h'><h2>Fuentes consultadas</h2></div><table class='ptbl src'><thead><tr><th>Fuente</th><th>Entidad responsable</th></tr></thead><tbody>";
    Object.keys(SOURCES).forEach(function (k) { if (run.results[k] && run.results[k].estado === "no aplica") return; h += "<tr><td><b>" + esc(SOURCES[k].nombre) + "</b></td><td>" + esc(SOURCES[k].entidad) + "</td></tr>"; });
    h += "</tbody></table>";

    h += "<div class='p-h'><h2>Alcance y advertencias</h2></div><div class='disc'>" + LEGAL_TXT.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + "</div></main></body></html>";
    return h;
  }

  function printReport(state, borrador) {
    var ifr = document.createElement("iframe");
    ifr.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    document.body.appendChild(ifr);
    var w = ifr.contentWindow, d = w.document, done = false;
    d.open(); d.write(reportHTML(state, borrador)); d.close();
    var go = function () {
      if (done) return; done = true;
      w.focus(); w.print();
      setTimeout(function () { ifr.remove(); }, 2000);
    };
    var waits = [].slice.call(d.images).map(function (im) { return im.complete ? null : new Promise(function (r) { im.onload = im.onerror = r; }); }).filter(Boolean);
    if (d.fonts && d.fonts.ready) waits.push(d.fonts.ready);
    Promise.all(waits).then(function () { setTimeout(go, 150); });
    setTimeout(go, 3000);
  }

  // ============================================================ descarga directa del PDF
  // Renderiza el mismo HTML del informe y lo pagina en un PDF tamaño carta (sin diálogo de impresión).
  var PDF_LIBS = [
    ["html2canvas", "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"],
    ["jspdf", "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"],
  ];
  var libsPromise = null;
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = src; s.async = true;
      s.onload = res; s.onerror = function () { rej(new Error("No se pudo cargar " + src)); };
      document.head.appendChild(s);
    });
  }
  function loadPdfLibs() {
    if (!libsPromise) {
      libsPromise = PDF_LIBS.reduce(function (p, l) {
        return p.then(function () { return window[l[0]] ? null : loadScript(l[1]); });
      }, Promise.resolve());
      libsPromise.catch(function () { libsPromise = null; });
    }
    return libsPromise;
  }
  // Vuelve transparente el fondo blanco del logo (en el PDF no hay mix-blend-mode)
  function logoSinFondo(src) {
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () {
        try {
          var c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
          var g = c.getContext("2d"); g.drawImage(im, 0, 0);
          var d = g.getImageData(0, 0, c.width, c.height), a = d.data;
          for (var i = 0; i < a.length; i += 4) { var m = Math.min(a[i], a[i + 1], a[i + 2]); if (m > 235) a[i + 3] = Math.round(255 * (255 - m) / 20); }
          g.putImageData(d, 0, 0); res(c.toDataURL("image/png"));
        } catch (e) { res(src); }
      };
      im.onerror = function () { res(src); };
      im.src = src;
    });
  }

  function exportPDF(state, fileName) {
    var MM = 96 / 25.4, PW = 215.9, PH = 279.4, TOP = 12, BOT = 14, W = 816;
    var avail = (PH - TOP - BOT) * MM;  // alto útil por página en px CSS
    var ifr = document.createElement("iframe");
    ifr.style.cssText = "position:fixed;left:-10000px;top:0;width:" + W + "px;height:1200px;border:0;visibility:hidden";
    document.body.appendChild(ifr);
    var cleanup = function () { try { ifr.remove(); } catch (e) { } };
    var html = reportHTML(state, false).replace("</style>", "html,body{background:#fff;width:" + W + "px}.p-head img{mix-blend-mode:normal}</style>");
    return Promise.all([loadPdfLibs(), logoSinFondo(CONFIG.logoUrl)]).then(function (r) {
      var logo = r[1];
      return new Promise(function (res) {
        ifr.onload = res;
        var d = ifr.contentWindow.document; d.open(); d.write(html); d.close();
        setTimeout(res, 2500);
      }).then(function () {
        var d = ifr.contentDocument;
        [].forEach.call(d.querySelectorAll(".p-head img"), function (im) { im.src = logo; });
        var waits = [].slice.call(d.images).map(function (im) { return im.complete ? null : new Promise(function (r2) { im.onload = im.onerror = r2; }); }).filter(Boolean);
        if (d.fonts && d.fonts.ready) waits.push(d.fonts.ready);
        return Promise.race([Promise.all(waits), new Promise(function (r2) { setTimeout(r2, 4000); })]).then(function () { return d; });
      });
    }).then(function (d) {
      var body = d.body, top0 = body.getBoundingClientRect().top;
      var H = Math.ceil(body.scrollHeight);
      ifr.style.height = H + "px";
      var y = function (el) { return el.getBoundingClientRect().top - top0; };
      // Puntos de corte permitidos: inicio de bloques, filas y párrafos. Corte obligatorio antes de .pb
      var cuts = [], forced = [];
      [].forEach.call(d.querySelectorAll("main.pg > *, .ptbl tbody tr, .grp, .g-src, .g-hd, .g-note, .disc p, .p-h"), function (el) {
        var t = Math.round(y(el)); if (t > 0) cuts.push(t);
      });
      [].forEach.call(d.querySelectorAll(".pb"), function (el) { forced.push(Math.round(y(el))); });
      // Un título de sección nunca queda solo al final de la página: se corta antes del título
      [].forEach.call(d.querySelectorAll(".p-h"), function (el) {
        var t = Math.round(y(el)), b = t + el.offsetHeight + 40;
        cuts = cuts.filter(function (c) { return c <= t || c > b; });
      });
      cuts = cuts.concat(forced).sort(function (a, b) { return a - b; });
      var pages = [], start = 0;
      while (start < H - 2) {
        var limit = start + avail, end = Math.min(H, limit);
        var f = forced.filter(function (c) { return c > start + 20 && c <= limit; })[0];
        if (f) end = f;
        else if (limit < H) {
          var ok = cuts.filter(function (c) { return c > start + avail * 0.35 && c <= limit; });
          if (ok.length) end = ok[ok.length - 1];
        }
        pages.push([start, end]); start = end;
      }
      return window.html2canvas(body, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: W, windowWidth: W, height: H, windowHeight: H, logging: false })
        .then(function (canvas) { return { canvas: canvas, pages: pages }; });
    }).then(function (o) {
      var JS = window.jspdf.jsPDF, pdf = new JS({ unit: "mm", format: "letter", compress: true });
      var sc = o.canvas.width / W, n = o.pages.length, run = state.run;
      var pie = CONFIG.product + " · " + run.id;
      pdf.setProperties({ title: CONFIG.product + " " + run.id, subject: run.input.nombre, author: CONFIG.brand, creator: "DataStore CCB" });
      o.pages.forEach(function (pg, i) {
        if (i) pdf.addPage();
        var hpx = Math.max(1, Math.round((pg[1] - pg[0]) * sc));
        var c = document.createElement("canvas"); c.width = o.canvas.width; c.height = hpx;
        var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(o.canvas, 0, Math.round(pg[0] * sc), c.width, hpx, 0, 0, c.width, hpx);
        pdf.addImage(c.toDataURL("image/jpeg", 0.88), "JPEG", 0, TOP, PW, (pg[1] - pg[0]) / MM, undefined, "FAST");
        // Pie de página: franja de marca con número de página
        pdf.setFillColor(8, 162, 183); pdf.rect(0, PH - BOT + 4, PW, BOT - 4, "F");
        pdf.setTextColor(255, 255, 255); pdf.setFontSize(6.5);
        pdf.setFont("courier", "normal"); pdf.text(pie, 14, PH - BOT + 9.6);
        pdf.setFont("helvetica", "normal"); pdf.text("Página " + (i + 1) + " de " + n, PW - 14, PH - BOT + 9.6, { align: "right" });
      });
      pdf.save(fileName + ".pdf");
      cleanup();
    }).catch(function (e) { cleanup(); throw e; });
  }

  // ============================================================ exportación
  var API = {
    CONFIG: CONFIG, normName: normName, nitDV: nitDV, docVariants: docVariants, jaroWinkler: jaroWinkler,
    nameScore: nameScore, classify: classify, resultLevel: resultLevel, globalLevel: globalLevel,
    screenInternational: screenInternational, runScreening: runScreening, reportHTML: reportHTML, exportPDF: exportPDF, mount: mount,
    fmtDocumento: fmtDocumento, verifCode: verifCode, runStats: runStats, allFindings: allFindings, SOURCES: SOURCES,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.CCBScreening = API;

  if (typeof document !== "undefined") {
    var start = function () { mount(document.getElementById(CONFIG.target)); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  }
})(typeof window !== "undefined" ? window : this);
