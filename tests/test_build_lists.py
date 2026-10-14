"""Pruebas de los parsers con muestras en el formato oficial de cada fuente."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
import build_lists as b  # noqa: E402

UN_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<CONSOLIDATED_LIST dateGenerated="2026-10-13T00:00:00">
 <INDIVIDUALS>
  <INDIVIDUAL>
   <DATAID>1</DATAID><FIRST_NAME>JUAN</FIRST_NAME><SECOND_NAME>CARLOS</SECOND_NAME><THIRD_NAME>P\xc3\x89REZ</THIRD_NAME>
   <UN_LIST_TYPE>Al-Qaida</UN_LIST_TYPE><REFERENCE_NUMBER>QDi.999</REFERENCE_NUMBER><LISTED_ON>2001-01-01</LISTED_ON>
   <NATIONALITY><VALUE>Colombia</VALUE></NATIONALITY>
   <INDIVIDUAL_ALIAS><QUALITY>Good</QUALITY><ALIAS_NAME>El Mono</ALIAS_NAME></INDIVIDUAL_ALIAS>
   <INDIVIDUAL_DATE_OF_BIRTH><DATE>1970-05-05</DATE></INDIVIDUAL_DATE_OF_BIRTH>
   <INDIVIDUAL_DOCUMENT><TYPE_OF_DOCUMENT>Passport</TYPE_OF_DOCUMENT><NUMBER>AB 123.456</NUMBER></INDIVIDUAL_DOCUMENT>
  </INDIVIDUAL>
 </INDIVIDUALS>
 <ENTITIES>
  <ENTITY><FIRST_NAME>COMERCIALIZADORA EJEMPLO S.A.S.</FIRST_NAME><REFERENCE_NUMBER>QDe.1</REFERENCE_NUMBER>
   <ENTITY_ALIAS><ALIAS_NAME>EJEMPLO LTDA</ALIAS_NAME></ENTITY_ALIAS></ENTITY>
 </ENTITIES>
</CONSOLIDATED_LIST>"""

SDN = (
    '36,"AEROCARIBBEAN AIRLINES",-0- ,"CUBA",-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,"Havana, Cuba."\n'
    '1234,"GOMEZ RESTREPO, Pedro Antonio","individual","SDNT",-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,'
    '"DOB 12 Mar 1965; POB Medellin, Colombia; Cedula No. 71.234.567 (Colombia); Passport AK123456 (Colombia)."\n'
    '5678,"INVERSIONES EJEMPLO S.A.S.",-0- ,"SDNT",-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,-0- ,'
    '"Cali, Colombia; NIT # 800123456-7 (Colombia)."\n'
).encode("latin-1")
ALT = b'1234,1,"aka","GOMEZ, Pedro",-0- \n'

EU_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<export xmlns="http://eu.europa.ec/fpi/fsd/export" generationDate="2026-10-13">
 <sanctionEntity logicalId="13" euReferenceNumber="EU.1.2">
  <regulation programme="COL"/>
  <subjectType code="person"/>
  <nameAlias wholeName="Mar\xc3\xada Fern\xc3\xa1ndez L\xc3\xb3pez" firstName="Mar\xc3\xada" lastName="Fern\xc3\xa1ndez"/>
  <nameAlias wholeName="Maria F. Lopez"/>
  <birthdate birthdate="1980-02-02"/>
  <identification number="52.111.222" identificationTypeCode="id"/>
  <citizenship countryDescription="COLOMBIA"/>
 </sanctionEntity>
</export>"""


def test_norm():
    assert b.norm_name("Comercializadora Ejemplo S.A.S.") == "COMERCIALIZADORA EJEMPLO"
    assert b.norm_name("José Pérez de la Torre") == "JOSE PEREZ TORRE"
    assert b.norm_doc("800.123.456-7") == ["800123456", "8001234567"]
    assert b.norm_doc("71.234.567") == ["71234567"]


def test_un():
    rows = b.parse_un(UN_XML)
    assert len(rows) == 2
    p = rows[0]
    assert p[1] == "P" and p[2] == "JUAN CARLOS PÉREZ"
    assert "MONO" in p[3] and "AB123456" in p[4]
    assert p[5]["nac"] == "1970-05-05" and p[5]["pais"] == "Colombia"
    assert rows[1][1] == "E" and rows[1][3] == ["COMERCIALIZADORA EJEMPLO", "EJEMPLO"]


def test_ofac():
    rows = b.parse_ofac(SDN, ALT, "OFAC_SDN")
    assert len(rows) == 3
    per = rows[1]
    assert per[1] == "P"
    assert "71234567" in per[4] and "AK123456" in per[4]
    assert "GOMEZ PEDRO" in per[3]
    assert per[5]["nac"] == "12 Mar 1965"
    ent = rows[2]
    assert "800123456" in ent[4] and "8001234567" in ent[4]


def test_eu():
    rows = b.parse_eu(EU_XML)
    assert len(rows) == 1
    r = rows[0]
    assert r[1] == "P" and r[2] == "María Fernández López"
    assert "MARIA FERNANDEZ LOPEZ" in r[3] and "52111222" in r[4]
    assert r[5]["prog"] == "COL" and r[5]["pais"] == "COLOMBIA"


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
