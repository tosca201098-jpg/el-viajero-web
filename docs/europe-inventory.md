# Europa: inventario de países, fichas y aeropuertos pendientes

Fecha: 6 de noviembre de 2026. Fase 1 del plan «terminar Europa y mejorar imágenes».
Los recuentos de fichas están medidos cargando el catálogo de cada rama. Las listas de aeropuertos pendientes **no están verificadas todavía**: ningún país se da por completo hasta comparar el inventario del proveedor (`iata_type=airport`, `flightable=true`) con las fichas, según `docs/airport-coverage-policy.md` (PR #44).

## 1. Con fichas ya en `main` (14 países)

| País | Fichas en main | Estado | Aeropuertos pendientes |
|---|---|---|---|
| España | 43 (publicadas) | Original, con Canarias y Baleares | Por auditar |
| Portugal | 22 (publicadas) | Original; incluye islas | Por auditar |
| Francia | 12 | Ampliada a 36 en la PR #44 (borrador) | Quedan 20 aceptados por incorporar + CER, LEH, CHR (carencias del proveedor) y casos sin evidencia |
| Italia | 12 | Parcial | Por auditar (hay muchos más aeropuertos comerciales) |
| Reino Unido | 12 | Parcial | Por auditar |
| Alemania | 12 | Parcial | Por auditar |
| Países Bajos | 12 | Parcial | Por auditar |
| Bélgica | 12 | Parcial | Por auditar |
| Suiza | 12 | Parcial | Por auditar |
| Austria | 12 | Parcial | Por auditar |
| Chequia | 12 | Parcial | Por auditar |
| Polonia | 12 | Parcial | Por auditar |
| Hungría | 12 | Parcial | Por auditar |
| Eslovaquia | 12 | Parcial | Por auditar |

## 2. En PR abiertas, aún no en `main`

| País | PR | Contenido |
|---|---|---|
| Grecia | #39, #42 (la #42 incluye la #39); también dentro de #40 y #44 | 15 fichas; la #42 amplía a 39 aeropuertos según su documento |
| Croacia | #36, #41 (la #41 incluye la #36) | 12 fichas, 15 con la ampliación |
| Eslovenia | #40 | 3 fichas |
| Albania | #45 (borrador, Claude) | 1 ficha: Tirana (TIA). KFZ y VLO excluidos por falta de servicio verificado |

## 3. Países europeos sin fichas

Pendientes de investigar, en este orden propuesto (Balcanes y vecinos primero, por estar ya documentados en `docs/airport-country-progress.md`):

1. Balcanes: Bosnia y Herzegovina, Serbia, Montenegro, Macedonia del Norte, Kosovo.
2. Sur y este: Malta, Chipre, Rumanía, Bulgaria, Moldavia.
3. Nórdicos: Dinamarca, Suecia, Noruega, Finlandia, Islandia.
4. Irlanda y bálticos: Irlanda, Estonia, Letonia, Lituania.
5. Pequeños: Luxemburgo. Andorra, Mónaco, San Marino, Liechtenstein y Ciudad del Vaticano no tienen aeropuerto comercial propio: se resuelven con las fichas de los países vecinos que los sirven.
6. Territorios: Gibraltar, Jersey, Guernsey, Isla de Man, Islas Feroe, Åland. Madeira, Azores, Canarias y Baleares ya cuelgan de Portugal y España.

## 4. Decisiones de alcance que necesito del propietario (antes de llegar a ellas)

- Turquía y Cáucaso (Georgia, Armenia, Azerbaiyán): ¿se incluyen en «Europa»? Propuesta: Turquía sí (Estambul y Tracia europea, más costa turística), Cáucaso en la fase del resto del mundo.
- Rusia y Bielorrusia: sanciones y espacio aéreo restringido; propuesta: excluirlas hasta tener servicio comercial verificable y ofrecido por el proveedor.
- Ucrania: sin vuelos comerciales regulares verificados; propuesta: excluirla y documentarlo.

## 5. Siguiente orden de trabajo

1. Francia: lotes sobre la PR #44 (sin tocar su contenido).
2. Países parcialmente desarrollados de la sección 1, auditándolos contra el inventario del proveedor.
3. Países sin fichas (sección 3).
4. Informe final de Europa y solo entonces la Fase 2 (imágenes).

## 6. Limitaciones conocidas

- Las comprobaciones de build y revisión visual dependen del Preview de Vercel; el Preview está protegido por inicio de sesión.
- El inventario del proveedor y Wikimedia Commons no son accesibles desde la terminal; se consultan por el navegador del panel con aprobación.
