# Dinamarca, Islandia y Finlandia: aeropuertos y fichas

Estado: borrador (`publication.status = 'draft'`). No aparecen en portada, sitemap ni recomendaciones automáticas; solo con selección explícita en el buscador. Las 16 tarjetas originales no se tocan.

## Fichas incluidas (15)

| Destino | País | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|---|
| Copenhague | Dinamarca | CPH | `dk-copenhagen` | Julian Herzog, CC BY 4.0 |
| Aarhus | Dinamarca | AAR | `dk-aarhus` | Gordon Leggett, CC BY-SA 4.0 |
| Billund | Dinamarca | BLL | `dk-billund` | Beethoven9, CC BY-SA 4.0 |
| Aalborg | Dinamarca | AAL | `dk-aalborg` | Västgöten, CC BY-SA 3.0 |
| Bornholm | Dinamarca | RNN | `dk-bornholm` | Johan Wessman / News Oresund, CC BY 2.0 |
| Reikiavik | Islandia | KEF | `is-reykjavik` | Hyppolyte de Saint-Rambert, CC BY-SA 4.0 |
| Akureyri | Islandia | AEY | `is-akureyri` | Brad Weber, CC BY-SA 3.0 |
| Helsinki | Finlandia | HEL | `fi-helsinki` | Matti Mattila, CC BY 2.0 |
| Rovaniemi | Finlandia | RVN | `fi-rovaniemi` | Timo Newton-Syms, CC BY-SA 2.0 |
| Turku | Finlandia | TKU | `fi-turku` | kallerna, CC BY-SA 3.0 |
| Tampere | Finlandia | TMP | `fi-tampere` | Methem (Mikko J. Putkonen), CC BY 3.0 |
| Oulu | Finlandia | OUL | `fi-oulu` | Estormiz, CC0 |
| Levi (Kittilä) | Finlandia | KTT | `fi-levi` | Ximonic (Simo Räsänen), CC BY-SA 4.0 |
| Ivalo | Finlandia | IVL | `fi-ivalo` | Ximonic (Simo Räsänen), CC BY-SA 3.0 |
| Kuusamo | Finlandia | KAO | `fi-kuusamo` | Ximonic (Simo Räsänen), CC BY-SA 3.0 |

## Criterios y fuentes

- Aeropuertos con `flightable=true` en el inventario de Travelpayouts (consulta del 6/11/2026; `tests/fixtures/nordics-airport-provider.json`) y con tráfico regular de pasajeros conocido. Esa marca no prueba servicio actual: no se ha inventado ninguna ruta, precio ni disponibilidad.
- Reikiavik usa el aeropuerto de Keflavík (KEF) con el código metropolitano REK. Levi (KTT), Ivalo (IVL) y Kuusamo (KAO) se presentan por el destino turístico al que dan servicio; las fichas indican el traslado.
- Las auroras boreales se describen como no garantizadas.
- Fotos de Wikimedia Commons (CC BY, CC BY-SA o CC0), con autor y enlace en cada ficha. Mejorables en la fase 2: Oulu (teatro de verano de Hupisaaret), Ivalo (carretera junto al lago Inari) y Bornholm (castillo de Hammershus a distancia).

## Excluidos o pendientes (sin ficha)

| Código | Lugar | Motivo |
|---|---|---|
| EBJ, KRP, SGD | Esbjerg, Karup, Sønderborg | Pendientes de verificar servicio regular actual |
| EGS, IFJ | Egilsstaðir, Ísafjörður | Pendientes: servicio doméstico limitado |
| JOE, VAA, KUO, JYV, POR, KEM, KAJ, SVL, KOK | Regionales finlandeses | Pendientes: interés turístico bajo o servicio por verificar |

Suecia y Noruega van en el lote siguiente.

## Pruebas

Suite completa: 442 pruebas, 435 correctas y 7 fallos de entorno ya existentes (faltan dependencias). No se ha podido ejecutar `next build` ni revisión visual (red desactivada; Preview de Vercel protegida): quedan pendientes.
