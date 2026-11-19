# Japón: inventario de tarjetas aeroportuarias

Preparación local iniciada el 13 de noviembre de 2026 en la rama `codex/japan-airports`. Este trabajo no modifica la portada, las 16 tarjetas aprobadas, Producción ni ninguna integración comercial.

## Criterio de inclusión

Se prepara una ficha por ciudad o isla turística servida, no una ficha por terminal. Los aeropuertos que dan servicio a la misma ciudad comparten tarjeta: Tokio (HND/NRT), Osaka (ITM/KIX), Sapporo (CTS/OKD) y Nagoya (NGO/NKM). Se incluyen conexiones nacionales, regionales e insulares con pasajeros cuando una aerolínea nacional mantiene una guía o ruta comercial contemporánea. Las instalaciones militares, privadas y helipuertos quedan fuera.

Cada ficha sigue el estilo aprobado: imagen panorámica verificable de Wikimedia Commons con autor, página de origen y licencia; siete idiomas; cuatro recomendaciones; temporadas; identificador IATA físico; y acceso explícito desde el buscador. Las imágenes se han elegido por ciudad o región turística para que no aparezcan fotos genéricas sin relación. Todas comienzan como borradores y no se añaden a portada, recomendaciones automáticas, meses ni sitemap.

## Fuentes de alcance

- [Ministerio japonés de Tierra, Infraestructuras, Transporte y Turismo: lista de aeropuertos](https://www.mlit.go.jp/koku/15_bf_000310.html), consultada el 13/11/2026. Distingue 28 aeropuertos centrales, 54 locales, 7 adicionales y 8 de uso conjunto.
- [ANA: guía de aeropuertos nacionales](https://www.ana.co.jp/en/jp/guide/prepare/airport-guide/domestic/), consultada el 13/11/2026. Confirma los aeropuertos atendidos por una red comercial actual.
- [JAL: mapa y horarios nacionales](https://www.jal.co.jp/jp/en/dom/route/), consultado el 13/11/2026. Se usa para contrastar los destinos regionales e insulares.

Una ruta concreta puede variar por temporada o fecha. Las fichas no prometerán disponibilidad ni precios.

## Inventario de trabajo

El inventario se implementará y comprobará en lotes para mantener revisión visual de las imágenes y no inventar agrupaciones.

### Área metropolitana y centro

| Ficha | Aeropuerto(s) físicos | Nota de agrupación |
| --- | --- | --- |
| Tokio | HND, NRT | Dos aeropuertos de la misma área servida. |
| Osaka | ITM, KIX | Dos aeropuertos de la misma área servida. |
| Kobe | UKB | Ciudad propia; no duplicar como Osaka. |
| Nagoya | NGO, NKM | Dos aeropuertos de Nagoya. |
| Ibaraki | IBR | Ficha propia, no cuarto aeropuerto de Tokio. |
| Niigata | KIJ | Ciudad propia. |
| Matsumoto | MMJ | Ciudad propia. |
| Shizuoka | FSZ | Región de Shizuoka. |
| Hachijōjima | HAC | Isla, ficha propia. |
| Ōshima | OIM | Isla, ficha propia. |

### Hokkaidō

| Ficha | Aeropuerto(s) físicos |
| --- | --- |
| Sapporo | CTS, OKD |
| Hakodate | HKD |
| Asahikawa | AKJ |
| Obihiro | OBO |
| Kushiro | KUH |
| Wakkanai | WKJ |
| Memanbetsu | MMB |
| Nakashibetsu | SHB |
| Rishiri | RIS |
| Okushiri | OIR |
| Monbetsu | MBE |

### Tōhoku y Hokuriku

| Ficha | Aeropuerto(s) físicos | Nota de ciudad servida |
| --- | --- | --- |
| Aomori | AOJ | Ciudad propia. |
| Misawa | MSJ | Ciudad propia. |
| Morioka / Hanamaki | HNA | El aeropuerto está en Hanamaki y sirve la zona de Morioka. |
| Akita | AXT | Ciudad propia. |
| Ōdate | ONJ | Ōdate–Noshiro. |
| Yamagata | GAJ | Ciudad propia. |
| Shōnai | SYO | Área de Sakata/Tsuruoka; identidad turística por verificar. |
| Sendai | SDJ | Ciudad propia. |
| Fukushima | FKS | Área de Fukushima. |
| Toyama | TOY | Ciudad propia. |
| Kanazawa / Komatsu | KMQ | Aeropuerto de Komatsu que sirve Kanazawa. |
| Noto | NTQ | Península de Noto; continuidad de servicio que debe confirmarse al cerrar el lote. |

### Chūgoku y Shikoku

| Ficha | Aeropuerto(s) físicos |
| --- | --- |
| Okayama | OKJ |
| Hiroshima | HIJ |
| Iwakuni | IWK |
| Yamaguchi Ube | UBJ |
| Tottori | TTJ |
| Yonago | YGJ |
| Matsue / Izumo | IZO |
| Hagi-Iwami | IWJ |
| Takamatsu | TAK |
| Tokushima | TKS |
| Matsuyama | MYJ |
| Kōchi | KCZ |

### Kyūshū y Amami

| Ficha | Aeropuerto(s) físicos |
| --- | --- |
| Fukuoka | FUK |
| Kitakyūshū | KKJ |
| Saga | HSG |
| Nagasaki | NGS |
| Tsushima | TSJ |
| Iki | IKI |
| Goto Fukue | FUJ |
| Kumamoto | KMJ |
| Amakusa | AXJ |
| Ōita / Beppu | OIT |
| Miyazaki | KMI |
| Kagoshima | KOJ |
| Tanegashima | TNE |
| Yakushima | KUM |
| Amami Ōshima | ASJ |
| Kikai | KKX |
| Tokunoshima | TKN |
| Okinoerabu | OKE |
| Yoron | RNJ |

### Okinawa y Sakishima

| Ficha | Aeropuerto(s) físicos |
| --- | --- |
| Naha | OKA |
| Kumejima | UEO |
| Miyakojima | MMY |
| Shimojishima | SHI |
| Tarama | TRA |
| Ishigaki | ISG |
| Yonaguni | OGN |
| Minamidaitō | MMD |
| Kitadaitō | KTD |

## Resultado del primer lote local

- **73 fichas** cubren los **77 códigos de aeropuerto de pasajeros** que el proveedor identifica como utilizables en Japón. La estación de autobuses LMJ se excluye expresamente.
- Solo se agrupan ciudades con más de un aeropuerto físico que sirve a la misma ciudad: Tokio (HND/NRT), Osaka (ITM/KIX), Sapporo (CTS/OKD) y Nagoya (NGO/NKM). Kobe (UKB) conserva tarjeta propia aunque el proveedor lo asocie al área de Osaka.
- Oshima, Tarama, Amakusa y otros aeródromos que el proveedor no marca como utilizables quedan fuera de este lote: no se anuncian como destinos de vuelo hasta que haya una fuente de reserva compatible.
- Todas las fichas son borradores y no modifican las 16 tarjetas de la portada, rutas publicadas, sitemap ni recomendaciones automáticas.

## Fotos propias por ficha (19-11-2026)

46 fichas pasan de la foto compartida por zona a una foto propia de Unsplash, elegida por el propietario entre las candidatas revisadas (lugar leído en la página de cada foto, licencia gratuita de Unsplash, horizontal, al menos 1600 px de ancho y sin repetir ninguna). Las 27 fichas restantes conservan la foto que ya tenían: 6 porque ya tenían una foto propia no repetida (Tokio, Osaka, Nagoya, Hakodate, Hiroshima y Kagoshima) y 21 porque el propietario marcó «Mantener la actual» (14 de ellas porque no hay una foto libre y fiable de su lugar). Falta revisar el encuadre de cada foto en una Preview de Vercel.
