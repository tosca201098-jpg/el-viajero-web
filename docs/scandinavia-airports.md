# Suecia y Noruega: aeropuertos y fichas

Estado: borrador (`publication.status = 'draft'`). No aparecen en portada, sitemap ni recomendaciones automáticas; solo con selección explícita en el buscador. Las 16 tarjetas originales no se tocan.

## Fichas incluidas (16)

| Destino | País | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|---|
| Estocolmo | Suecia | ARN | `se-stockholm` | Arild Vågen, CC BY-SA 3.0 |
| Gotemburgo | Suecia | GOT | `se-gothenburg` | Andrzej Otrębski, CC BY-SA 3.0 |
| Malmö | Suecia | MMX | `se-malmo` | Hernán Piñera, CC BY-SA 2.0 |
| Kiruna | Suecia | KRN | `se-kiruna` | Stephan Herz, CC BY 2.5 |
| Luleå | Suecia | LLA | `se-lulea` | Stephan Herz, CC BY 2.5 |
| Östersund (Åre) | Suecia | OSD | `se-ostersund` | Dieter Wirz, CC BY-SA 3.0 |
| Visby | Suecia | VBY | `se-visby` | Berit from Redhill/Surrey, UK, CC BY 2.0 |
| Oslo | Noruega | OSL | `no-oslo` | Pudelek (Marcin Szala), CC BY-SA 4.0 |
| Bergen (Noruega) | Noruega | BGO | `no-bergen` | Petr Šmerkl, CC BY-SA 3.0 |
| Trondheim | Noruega | TRD | `no-trondheim` | Erik A. Drabløs, CC BY-SA 3.0 |
| Stavanger | Noruega | SVG | `no-stavanger` | Svein-Magne Tunli, CC BY-SA 3.0 |
| Tromsø | Noruega | TOS | `no-tromso` | Godot13, CC BY-SA 4.0 |
| Bodø | Noruega | BOO | `no-bodo` | Frankemann, CC BY-SA 4.0 |
| Ålesund | Noruega | AES | `no-alesund` | michael clarke stuff, CC BY-SA 2.0 |
| Kirkenes | Noruega | KKN | `no-kirkenes` | Clemensfranz, CC BY-SA 3.0 |
| Svolvær (Lofoten) | Noruega | SVJ | `no-svolvaer` | Mænsard vokser, CC BY-SA 4.0 |

## Criterios y fuentes

- Aeropuertos con `flightable=true` en el inventario de Travelpayouts (consulta del 6/11/2026; `tests/fixtures/scandinavia-airport-provider.json`) y con tráfico regular de pasajeros conocido. Esa marca no prueba servicio actual: no se ha inventado ninguna ruta, precio ni disponibilidad.
- Estocolmo y Malmö llevan además sus códigos metropolitanos (STO y MMA). Los otros aeropuertos de Estocolmo (Bromma, Skavsta) y de Oslo (Torp, Rygge) no se cubren en estas fichas.
- **Bergen:** el nombre «Bergen» ya era un alias de Mons (Bélgica). Para no tocar esa ficha, la de Noruega se llama «Bergen (Noruega)»; la selección por país y por el aeropuerto BGO distingue ambas. Se ha actualizado la prueba de Bélgica, que antes esperaba que Bergen (Noruega) no resolviera a ninguna ficha.
- Las auroras boreales se describen como no garantizadas; Kiruna, Åre, Svolvær y Kirkenes indican traslado y estacionalidad.
- Fotos de Wikimedia Commons (CC BY o CC BY-SA), con autor y enlace en cada ficha. Mejorables en la fase 2: Kirkenes (calle peatonal en invierno), Östersund (vista desde Frösön) y Lofoten (lago y montañas, sin pueblo).

## Excluidos o pendientes (sin ficha)

| Código | Lugar | Motivo |
|---|---|---|
| UME, KSD, SDL, JKG, ORB | Umeå, Karlstad, Sundsvall, Jönköping, Örebro | Pendientes: interés turístico bajo o servicio por verificar |
| KRS, ALF, HAU, MOL, KSU, EVE, LKN | Kristiansand, Alta, Haugesund, Molde, Kristiansund, Harstad-Narvik, Leknes | Pendientes de verificar; Alta y Kristiansand son buenos candidatos para un lote posterior |
| Otros regionales | Resto de aeropuertos pequeños de Suecia y Noruega | Pendientes |

## Pruebas

Suite completa: 453 pruebas, 446 correctas y 7 fallos de entorno ya existentes (faltan dependencias). No se ha podido ejecutar `next build` ni revisión visual (red desactivada; Preview de Vercel protegida): quedan pendientes.
