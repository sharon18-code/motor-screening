# Motor de Screening CCB

Cruce de personas y empresas contra listas restrictivas abiertas, con informe PDF bajo marca DataStore CCB. Corre completo en el navegador (Code Embed de Webflow); no guarda consultas.

## Fuentes

| Fuente | Entidad | Cómo se consulta |
| --- | --- | --- |
| Lista Consolidada ONU | Consejo de Seguridad | Archivo diario `data/listas.json` |
| OFAC SDN y consolidada | Tesoro de EE. UU. | Archivo diario `data/listas.json` |
| Sanciones financieras UE | Comisión Europea | Archivo diario `data/listas.json` |
| Antecedentes SIRI | Procuraduría | API datos.gov.co `iaeu-rcn6` en vivo |
| Multas SECOP I y II | Colombia Compra Eficiente | API datos.gov.co `4n4q-k399`, `it5q-hg94` |
| Sanciones en firme SIC | SIC | API datos.gov.co `73dx-n59j` |
| Sancionatorios INVIMA | INVIMA | API datos.gov.co `rq4n-pzga` |
| Sanciones contadores | Junta Central de Contadores | API datos.gov.co `fs36-azrv` |

Estados de cada hallazgo: **Identificada** (documento, o nombre idéntico con dato adicional) u **Homónimo al X %**. Por fuente: Sin coincidencias o Consulta no disponible.

## Cómo funciona

1. `.github/workflows/listas.yml` corre todos los días a la 1:17 a. m. (hora Colombia), ejecuta `scripts/build_lists.py` y publica `data/listas.json`. Si una fuente falla, conserva su versión anterior y la marca como desactualizada.
2. `dist/screening.js` se carga desde jsDelivr dentro de un Code Embed, consulta las fuentes, clasifica cada coincidencia y arma la matriz.
3. Las reglas de severidad y confianza están documentadas en la ficha de producto (sección 4).

## Pegar en Webflow

Ver `webflow-embed.html`. Atributos opcionales del `<script>`:

| Atributo | Para qué |
| --- | --- |
| `data-lists` | URL de `listas.json` (obligatorio) |
| `data-app-token` | Token gratuito de datos.gov.co para más cupo |
| `data-logo` | URL del logo para pantalla e informe |
| `data-color`, `data-accent` | Colores de marca |
| `data-brand`, `data-product` | Textos del encabezado del informe |

## Pruebas

```
python3 tests/test_build_lists.py
node tests/test_engine.js
```

## Aviso

Una coincidencia en una lista es un indicador para verificar, no prueba de conducta ilícita. Los datos de datos.gov.co se usan bajo licencia CC BY-SA 4.0 con atribución a cada entidad.
