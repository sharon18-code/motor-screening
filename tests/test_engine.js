// Pruebas del motor (node tests/test_engine.js)
const assert = require("assert");
const { execSync } = require("child_process");
const path = require("path");
const S = require("../dist/screening.js");

let n = 0;
const t = (name, fn) => { fn(); n++; console.log("ok", name); };

t("normalización igual a Python", () => {
  const casos = ["Sociedad Fiduciaria de Desarrollo Agropecuario S.A.", "Comercializadora Ejemplo S.A.S.", "José Pérez de la Torre", "JL INGENIEROS OBRAS Y SUMINISTROS LTDA", "Ñandú & Cía. S.A."];
  const py = JSON.parse(execSync(
    `python3 -c "import sys,json; sys.path.insert(0,'${path.join(__dirname, "../scripts")}'); import build_lists as b; print(json.dumps([b.norm_name(x) for x in json.loads(sys.argv[1])]))" '${JSON.stringify(casos)}'`
  ).toString());
  assert.deepStrictEqual(casos.map(S.normName), py);
});

t("dígito de verificación NIT (casos reales de SECOP e INVIMA)", () => {
  assert.strictEqual(S.nitDV("900593921"), 7);
  assert.strictEqual(S.nitDV("900445791"), 2);
  assert.strictEqual(S.nitDV("860007322"), 9); // NIT de la CCB
});

t("variantes de documento", () => {
  assert.deepStrictEqual(S.docVariants("NIT", "900.593.921-7").all.sort(), ["900593921", "9005939217"]);
  assert.deepStrictEqual(S.docVariants("NIT", "9005939217").all.sort(), ["900593921", "9005939217"]);
  assert.deepStrictEqual(S.docVariants("NIT", "900593921").all.sort(), ["900593921", "9005939217"]);
  assert.deepStrictEqual(S.docVariants("CC", "71.234.567").all, ["71234567"]);
});

t("similitud de nombres", () => {
  const sc = (a, b) => S.nameScore(S.normName(a), S.normName(b));
  assert.strictEqual(sc("Pedro Antonio Gómez Restrepo", "GOMEZ RESTREPO, Pedro Antonio"), 1);
  assert.ok(sc("Pedro Gomez", "Pedro Antonio Gomez Restrepo") >= 0.9);
  assert.ok(sc("Pedro Gomes Restrepo", "Pedro Gomez Restrepo") >= 0.9);
  assert.ok(sc("Maria Lopez", "Mario Ramirez") < 0.9);
  assert.strictEqual(sc("Ejemplo", "Inversiones Ejemplo SAS"), 0); // una sola palabra no cruza parcial
  assert.ok(sc("JL Ingenieros Obras y Suministros SAS", "JL INGENIEROS OBRAS Y SUMINISTROS LTDA") === 1);
});

t("clasificación y matriz", () => {
  const q = { name: S.normName("Pedro Antonio Gomez Restrepo"), docs: ["71234567"], tipo: "P", nac: "" };
  assert.strictEqual(S.classify(q, { docs: ["71234567"], names: [] }).conf, "Confirmado");
  assert.strictEqual(S.classify(q, { docs: [], names: ["GOMEZ RESTREPO PEDRO ANTONIO"], tipo: "P" }).conf, "Probable");
  assert.strictEqual(S.classify(q, { docs: [], names: ["PEDRO ANTONIO GOMEZ"], tipo: "P" }).conf, "Posible homónimo");
  assert.strictEqual(S.classify(q, { docs: [], names: ["CARLOS RUIZ"] }), null);
  assert.strictEqual(S.resultLevel("Crítica", "Confirmado"), "Alto");
  assert.strictEqual(S.resultLevel("Alta", "Probable"), "Medio-alto");
  assert.strictEqual(S.resultLevel("Alta", "Posible homónimo"), "Medio");
  assert.strictEqual(S.resultLevel("Baja", "Posible homónimo"), "Informativo");
});

t("cruce internacional con listas generadas por el ETL", () => {
  const out = execSync(
    `cd ${path.join(__dirname, "..")} && python3 -c "
import sys,json; sys.path.insert(0,'scripts'); sys.path.insert(0,'tests')
import build_lists as b, test_build_lists as f
e = b.parse_un(f.UN_XML) + b.parse_ofac(f.SDN, f.ALT, 'OFAC_SDN') + b.parse_eu(f.EU_XML)
print(json.dumps({'fuentes':{}, 'e': e}))"`
  ).toString();
  const lists = JSON.parse(out);
  lists.byDoc = {};
  lists.e.forEach((r, i) => (r[4] || []).forEach(d => (lists.byDoc[d] = lists.byDoc[d] || []).push(i)));

  // Empresa por NIT sin dígito de verificación -> confirmado en OFAC
  let q = { name: S.normName("Inversiones Ejemplo SAS"), tipo: "E", nac: "", dv: S.docVariants("NIT", "800123456") };
  q.docs = q.dv.all;
  let h = S.screenInternational(q, lists);
  assert.strictEqual(h.OFAC_SDN[0].conf, "Confirmado");

  // Persona solo por nombre -> probable en OFAC (alias y orden distinto)
  q = { name: S.normName("Pedro Antonio Gómez Restrepo"), tipo: "P", nac: "", dv: S.docVariants("CC", "") };
  q.docs = q.dv.all;
  h = S.screenInternational(q, lists);
  assert.strictEqual(h.OFAC_SDN[0].conf, "Probable");

  // Persona UE con año de nacimiento
  q = { name: S.normName("Maria Fernandez Lopez"), tipo: "P", nac: "1980", dv: S.docVariants("CC", "") };
  q.docs = q.dv.all;
  h = S.screenInternational(q, lists);
  assert.strictEqual(h.UE[0].conf, "Probable");

  // Nombre que no está en ninguna lista
  q = { name: S.normName("Sharon Calderon Villamizar"), tipo: "P", nac: "", dv: S.docVariants("CC", "1000000") };
  q.docs = q.dv.all;
  assert.deepStrictEqual(S.screenInternational(q, lists), {});
});

t("informe se genera sin errores", () => {
  const run = {
    id: "CCB-TEST", fin: new Date(), inicio: new Date(),
    input: { tipoDoc: "NIT", numDoc: "800123456", nombre: "Inversiones <Ejemplo>", nac: "" },
    q: { name: "INVERSIONES EJEMPLO" },
    results: Object.fromEntries(Object.keys(S.SOURCES).map(k => [k, { estado: "ok", hits: [] }])),
  };
  run.results.OFAC_SDN.hits = [{ id: "x", conf: "Confirmado", motivo: "Documento idéntico", sev: "Alta", nivel: "Alto", revision: "automática", titulo: "INVERSIONES EJEMPLO", detalle: [["Programa", "SDNT"]] }];
  const html = S.reportHTML({ run, manual: [{ estado: "no" }, { estado: "limpio" }], analista: "" }, false);
  assert.ok(html.includes("Con coincidencias") && html.includes("Identificada") && html.includes("&lt;EJEMPLO&gt;") && !html.includes("<EJEMPLO>") && html.includes("Verificación:") && !/\bPEP\b.*No incluido/.test(html) && !/verificación manual/i.test(html));
  run.results.SECOP2.hits = [{ id: "y", conf: "Posible homónimo", score: 0.93, motivo: "", sev: "Media", titulo: "INVERSIONES EJEMPLOS", detalle: [["Sanción", "Multa"]] }];
  run.results.SIC = { estado: "error", hits: [] };
  const html2 = S.reportHTML({ run, analista: "" }, false);
  assert.ok(html2.includes("Homónimo al 93 %") && html2.includes("Consulta no disponible") && !/Verificada|Pendiente de revisión|Descartada/.test(html2));
  const st = S.runStats(run); assert.deepStrictEqual([st.ident, st.hom, st.nd], [1, 1, 1]);
  assert.strictEqual(S.globalLevel(run, []).nivel, "Alto");
});

console.log(`\n${n} pruebas OK`);
