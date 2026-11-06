# Europa: inventario de países, fichas y aeropuertos pendientes

Fecha: 6 de noviembre de 2026. Fase 1 del plan «terminar Europa y mejorar imágenes».
Los recuentos de fichas están medidos cargando el catálogo de cada rama. Las listas de aeropuertos pendientes **no están verificadas todavía**: ningún país se da por completo hasta comparar el inventario del proveedor (`iata_type=airport`, `flightable=true`) con las fichas, según `docs/airport-coverage-policy.md` (PR #44).

## 1. Con fichas ya en `main` (14 países)

| País | Fichas en main | Estado | Aeropuertos pendientes |
|---|---|---|---|
| España | 43 (publicadas) | Original, con Canarias y Baleares | Por auditar |
| Portugal | 22 (publicadas) | Original; incluye islas | Por auditar |
| Francia | 12 | Ampliada a 36 en la PR #44 y a 48 con la PR #47 (borrador). El código real tenía 36, no 28 | Todos los aceptados del inventario ya tienen ficha; quedan CER, LEH, CHR (carencias del proveedor) y casos sin evidencia |
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

## 4. Decisiones de alcance (confirmadas por el propietario el 6/11/2026)

- **Turquía:** se incluye en el catálogo europeo, con sus principales aeropuertos comerciales y turísticos (52 registros volables en el proveedor; hay que filtrarlos por servicio real).
- **Georgia, Armenia y Azerbaiyán:** quedan para la fase del catálogo mundial.
- **Rusia, Bielorrusia y Ucrania:** se investiga la situación real de sus aeropuertos. No se crean fichas que prometan vuelos comerciales inexistentes o no verificables. El proveedor marca como volables 251 registros rusos, 5 bielorrusos y 13 ucranianos, pero ese indicador no prueba servicio actual: se documentarán los aeropuertos pendientes de revisar.

## 4 bis. Inventario público del proveedor (Travelpayouts `airports.json`, 6/11/2026)

Registros con `iata_type=airport` y `flightable=true` frente al total de aeropuertos del país. Son el punto de partida de cada auditoría, no una lista de vuelos garantizados.

| País | Volables / total | País | Volables / total | País | Volables / total |
|---|---|---|---|---|---|
| Francia | 55/126 | Reino Unido | 54/109 | Turquía | 52/66 |
| España | 46/52 | Noruega | 46/52 | Italia | 41/56 |
| Grecia | 39/43 | Suecia | 39/52 | Alemania | 30/90 |
| Portugal | 19/24 | Finlandia | 17/32 | Rumanía | 16/19 |
| Polonia | 15/19 | Croacia | 8/9 | Suiza | 8/11 |
| Dinamarca | 8/18 | Islandia | 6/35 | Irlanda | 6/17 |
| Austria | 6/7 | Países Bajos | 6/13 | Chequia | 5/12 |
| Bélgica | 5/7 | Bulgaria | 4/12 | Bosnia y Herzegovina | 4/4 |
| Estonia | 4/5 | Lituania | 3/5 | Serbia | 3/5 |
| Hungría | 3/5 | Eslovaquia | 3/8 | Eslovenia | 3/3 |
| Montenegro | 2/4 | Moldavia | 2/3 | Chipre | 2/4 |
| Letonia | 2/4 | Albania | 2/3 | Macedonia del Norte | 2/2 |
| Malta, Luxemburgo, Kosovo, Gibraltar, Jersey, Guernsey, Isla de Man, Feroe, Åland | 1/1 cada uno | | | | |

Observaciones:
- Muchos registros son aeródromos regionales muy pequeños (por ejemplo, las islas Orcadas en Reino Unido). Un registro volable no basta para una ficha: hace falta oferta pública de pasajeros verificada, como en la política de cobertura.
- **Albania:** TIA figura como volable (comprobado). KFZ (Kukës) también figura como volable en el proveedor, aunque no he encontrado servicio regular verificado: queda **pendiente de revisar** antes de decidir. VLO no figura como volable.
- La diferencia entre fichas existentes y aeropuertos volables es grande en Reino Unido (12 fichas / 54), Italia (12 / 41), Alemania (12 / 30) y Turquía (0 / 52).

## 5. Siguiente orden de trabajo

1. Francia: cuarto lote preparado (PR #47, sobre la #44); quedan CER, LEH, CHR y los casos pendientes.
2. Países parcialmente desarrollados de la sección 1, auditándolos contra el inventario del proveedor.
3. Países sin fichas (sección 3).
4. Informe final de Europa y solo entonces la Fase 2 (imágenes).

## 6. Limitaciones conocidas

- Las comprobaciones de build y revisión visual dependen del Preview de Vercel; el Preview está protegido por inicio de sesión.
- El inventario del proveedor y Wikimedia Commons no son accesibles desde la terminal; se consultan por el navegador del panel con aprobación, agrupando las consultas en una sola carga.
