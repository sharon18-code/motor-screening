#!/usr/bin/env python3
"""
Motor de Screening CCB - construcción diaria de listas internacionales.

Descarga las listas oficiales (ONU, OFAC SDN, OFAC consolidada, UE),
normaliza nombres y documentos y publica data/listas.json.

Si una fuente falla, conserva la versión anterior de esa fuente y la marca
como "desactualizada" en lugar de romper todo el archivo.

Formato de salida (compacto, pensado para el navegador):
{
  "generado": "2026-10-14T06:00:00Z",
  "fuentes": {"ONU": {...}, "OFAC_SDN": {...}, ...},
  "e": [[fuente, tipo, nombre, [nombres_norm], [docs], extra], ...]
}
tipo: "P" persona, "E" entidad, "O" otro (buque, aeronave).
"""
import csv
import hashlib
import io
import json
import os
import re
import sys
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

OUT = os.path.join(os.path.dirname(__file__), "..", "data", "listas.json")
UA = "MotorScreeningCCB/1.0 (+https://www.ccb.org.co)"
TIMEOUT = 120

SOURCES = {
    "ONU": {
        "nombre": "Lista Consolidada del Consejo de Seguridad de la ONU",
        "url_publica": "https://www.un.org/securitycouncil/content/un-sc-consolidated-list",
        "urls": ["https://scsanctions.un.org/resources/xml/en/consolidated.xml"],
    },
    "OFAC_SDN": {
        "nombre": "OFAC - Specially Designated Nationals (SDN)",
        "url_publica": "https://ofac.treasury.gov/specially-designated-nationals-and-blocked-persons-list-sdn-human-readable-lists",
        "urls": {
            "prim": [
                "https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/SDN.CSV",
                "https://www.treasury.gov/ofac/downloads/sdn.csv",
            ],
            "alt": [
                "https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/ALT.CSV",
                "https://www.treasury.gov/ofac/downloads/alt.csv",
            ],
        },
    },
    "OFAC_CONS": {
        "nombre": "OFAC - Lista consolidada (no SDN)",
        "url_publica": "https://ofac.treasury.gov/consolidated-sanctions-list-non-sdn-lists",
        "urls": {
            "prim": [
                "https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/CONS_PRIM.CSV",
                "https://www.treasury.gov/ofac/downloads/consolidated/cons_prim.csv",
            ],
            "alt": [
                "https://sanctionslistservice.ofac.treas.gov/api/PublicationPreview/exports/CONS_ALT.CSV",
                "https://www.treasury.gov/ofac/downloads/consolidated/cons_alt.csv",
            ],
        },
    },
    "UE": {
        "nombre": "Unión Europea - Lista consolidada de sanciones financieras",
        "url_publica": "https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions",
        "urls": [
            "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw",
        ],
    },
}

# ---------------------------------------------------------------- normalización
# Debe coincidir exactamente con normName() de screening.js
LEGAL = {
    "SAS", "SA", "LTDA", "LIMITADA", "EU", "SCA", "SC", "BIC", "CIA", "Y",
    "INC", "LLC", "LTD", "CORP", "CO", "SRL", "SPA", "GMBH", "AG", "PLC",
    "DE", "DEL", "LA", "LAS", "LOS", "EL",
}


def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def norm_name(s):
    if not s:
        return ""
    s = strip_accents(str(s)).upper()
    s = re.sub(r"S\.\s*A\.\s*S\.?", " SAS ", s)
    s = re.sub(r"\bS\.\s*A\.?(?=\s|$|,)", " SA ", s)
    s = re.sub(r"[^A-Z0-9]+", " ", s)
    toks = [t for t in s.split() if t not in LEGAL]
    return " ".join(toks)


def norm_doc(s):
    """Devuelve variantes del documento: completo y, si trae guion, sin dígito de verificación."""
    if not s:
        return []
    s = strip_accents(str(s)).upper().strip()
    out = set()
    base = re.sub(r"[^A-Z0-9]", "", s)
    if len(base) >= 5:
        out.add(base)
    m = re.match(r"^([0-9\.\s]+)-\s*([0-9])$", s)
    if m:
        sin_dv = re.sub(r"[^0-9]", "", m.group(1))
        if len(sin_dv) >= 5:
            out.add(sin_dv)
    return sorted(out)


# ---------------------------------------------------------------- descarga
def fetch(urls):
    last = None
    for u in urls:
        try:
            req = urllib.request.Request(u, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                data = r.read()
            if len(data) < 500:
                raise ValueError(f"respuesta muy corta ({len(data)} bytes)")
            return data, u
        except Exception as e:  # noqa: BLE001
            last = e
            print(f"  ! fallo {u}: {e}", file=sys.stderr)
    raise RuntimeError(f"todas las URL fallaron: {last}")


def localname(tag):
    return tag.rsplit("}", 1)[-1]


# ---------------------------------------------------------------- parsers
def parse_un(xml_bytes):
    root = ET.fromstring(xml_bytes)
    out = []

    def txt(el, name):
        for c in el:
            if localname(c.tag) == name and c.text:
                return c.text.strip()
        return ""

    for el in root.iter():
        kind = localname(el.tag)
        if kind not in ("INDIVIDUAL", "ENTITY"):
            continue
        parts = [txt(el, n) for n in ("FIRST_NAME", "SECOND_NAME", "THIRD_NAME", "FOURTH_NAME")]
        nombre = " ".join(p for p in parts if p)
        names, docs, dob, nat = [nombre], [], "", []
        for c in el.iter():
            ln = localname(c.tag)
            if ln in ("INDIVIDUAL_ALIAS", "ENTITY_ALIAS"):
                a = txt(c, "ALIAS_NAME")
                if a:
                    names.append(a)
            elif ln == "INDIVIDUAL_DOCUMENT":
                docs += norm_doc(txt(c, "NUMBER"))
            elif ln == "INDIVIDUAL_DATE_OF_BIRTH" and not dob:
                dob = txt(c, "DATE") or txt(c, "YEAR")
            elif ln == "NATIONALITY":
                v = txt(c, "VALUE")
                if v:
                    nat.append(v)
        extra = {
            "ref": txt(el, "REFERENCE_NUMBER"),
            "prog": txt(el, "UN_LIST_TYPE"),
            "desde": txt(el, "LISTED_ON"),
        }
        if dob:
            extra["nac"] = dob
        if nat:
            extra["pais"] = ", ".join(nat)
        out.append(["ONU", "P" if kind == "INDIVIDUAL" else "E", nombre, uniq_norm(names), sorted(set(docs)), extra])
    return out


DOC_RE = re.compile(
    r"(?:Cedula No\.|C\.C\.|NIT #|RUC #|Passport|Pasaporte|National ID No\.|Identification Number|"
    r"D\.N\.I\.|Tax ID No\.|Registration ID|C\.U\.I\.T\.|RFC|CURP)\s*:?\s*([A-Z0-9][A-Z0-9\-\.\s]{3,20}?)(?=\s*[\(;,]|$)",
    re.I,
)
DOB_RE = re.compile(r"DOB\s+([0-9]{1,2}\s+[A-Za-z]{3}\s+[0-9]{4}|[0-9]{4})")


def clean_ofac(v):
    v = (v or "").strip()
    return "" if v == "-0-" else v


def parse_ofac(prim_bytes, alt_bytes, fuente):
    alts = {}
    if alt_bytes:
        for row in csv.reader(io.StringIO(alt_bytes.decode("latin-1"))):
            if len(row) >= 4 and row[0].strip().isdigit():
                alts.setdefault(row[0].strip(), []).append(clean_ofac(row[3]))
    out = []
    for row in csv.reader(io.StringIO(prim_bytes.decode("latin-1"))):
        if len(row) < 12 or not row[0].strip().isdigit():
            continue
        ent, name, typ, prog, remarks = row[0].strip(), clean_ofac(row[1]), clean_ofac(row[2]).lower(), clean_ofac(row[3]), clean_ofac(row[11])
        if not name:
            continue
        tipo = "P" if typ == "individual" else ("O" if typ in ("vessel", "aircraft") else "E")
        docs = []
        for m in DOC_RE.finditer(remarks):
            docs += norm_doc(m.group(1).strip())
        extra = {"ref": ent, "prog": prog}
        d = DOB_RE.search(remarks)
        if d:
            extra["nac"] = d.group(1)
        out.append([fuente, tipo, name.replace(",", ""), uniq_norm([name] + alts.get(ent, [])), sorted(set(docs)), extra])
    return out


def parse_eu(xml_bytes):
    root = ET.fromstring(xml_bytes)
    out = []
    for se in root.iter():
        if localname(se.tag) != "sanctionEntity":
            continue
        names, docs, prog, dob, pais, tipo = [], [], "", "", [], "E"
        for c in se:
            ln = localname(c.tag)
            if ln == "nameAlias":
                w = c.get("wholeName") or " ".join(x for x in (c.get("firstName"), c.get("middleName"), c.get("lastName")) if x)
                if w:
                    names.append(w)
            elif ln == "identification":
                docs += norm_doc(c.get("number") or "")
            elif ln == "regulation" and not prog:
                prog = c.get("programme") or ""
            elif ln == "birthdate" and not dob:
                dob = c.get("birthdate") or c.get("year") or ""
            elif ln == "citizenship" and c.get("countryDescription"):
                pais.append(c.get("countryDescription"))
            elif ln == "subjectType":
                tipo = "P" if (c.get("code") or "").lower() == "person" else "E"
        if not names:
            continue
        extra = {"ref": se.get("logicalId") or se.get("euReferenceNumber") or "", "prog": prog}
        if dob:
            extra["nac"] = dob
        if pais:
            extra["pais"] = ", ".join(sorted(set(pais)))
        out.append(["UE", tipo, names[0], uniq_norm(names), sorted(set(docs)), extra])
    return out


def uniq_norm(names):
    seen, out = set(), []
    for n in names:
        k = norm_name(n)
        if k and k not in seen:
            seen.add(k)
            out.append(k)
    return out


# ---------------------------------------------------------------- principal
def load_previous():
    try:
        with open(OUT, encoding="utf-8") as f:
            return json.load(f)
    except Exception:  # noqa: BLE001
        return {"fuentes": {}, "e": []}


def build():
    prev = load_previous()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    fuentes, entries = {}, []
    ok_count = 0

    for key, cfg in SOURCES.items():
        print(f"> {key}")
        try:
            if key == "ONU":
                data, used = fetch(cfg["urls"])
                rows = parse_un(data)
                digest = hashlib.sha256(data).hexdigest()
            elif key.startswith("OFAC"):
                prim, used = fetch(cfg["urls"]["prim"])
                try:
                    alt, _ = fetch(cfg["urls"]["alt"])
                except Exception:  # noqa: BLE001
                    alt = b""
                rows = parse_ofac(prim, alt, key)
                digest = hashlib.sha256(prim + alt).hexdigest()
            else:
                data, used = fetch(cfg["urls"])
                rows = parse_eu(data)
                digest = hashlib.sha256(data).hexdigest()
            if not rows:
                raise RuntimeError("0 registros: formato inesperado")
            fuentes[key] = {
                "nombre": cfg["nombre"], "url": cfg["url_publica"], "descarga": used,
                "fecha": now, "registros": len(rows), "sha256": digest, "estado": "ok",
            }
            entries += rows
            ok_count += 1
            print(f"  ok: {len(rows)} registros")
        except Exception as e:  # noqa: BLE001
            print(f"  ERROR {key}: {e}", file=sys.stderr)
            old = prev.get("fuentes", {}).get(key)
            old_rows = [r for r in prev.get("e", []) if r[0] == key]
            if old and old_rows:
                old = dict(old, estado="desactualizada", error=str(e)[:200])
                fuentes[key] = old
                entries += old_rows
            else:
                fuentes[key] = {"nombre": cfg["nombre"], "url": cfg["url_publica"], "estado": "no disponible", "error": str(e)[:200], "registros": 0}

    if ok_count == 0 and prev.get("e"):
        print("Ninguna fuente respondió; se conserva el archivo anterior.", file=sys.stderr)
        return 1

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    payload = {"version": 1, "generado": now, "fuentes": fuentes, "e": entries}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    print(f"listas.json: {len(entries)} registros, {os.path.getsize(OUT)/1e6:.1f} MB")
    return 0


if __name__ == "__main__":
    sys.exit(build())
