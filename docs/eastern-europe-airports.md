# Rumanía, Bulgaria y Moldavia: aeropuertos y fichas

Estado: borrador (`publication.status = 'draft'`). No aparecen en portada, sitemap ni recomendaciones automáticas; solo con selección explícita en el buscador. Las 16 tarjetas originales no se tocan.

## Fichas incluidas (15)

| Destino | País | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|---|
| Bucarest | Rumanía | OTP | `ro-bucharest` | William John Gauthier from Denmark, CC BY-SA 2.0 |
| Cluj-Napoca | Rumanía | CLJ | `ro-cluj-napoca` | Dennis G. Jarvis, CC BY-SA 2.0 |
| Timișoara | Rumanía | TSR | `ro-timisoara` | Marius Catalin Boldeanu, CC BY-SA 4.0 |
| Iași | Rumanía | IAS | `ro-iasi` | KittyKaliNeo, CC BY-SA 4.0 |
| Sibiu | Rumanía | SBZ | `ro-sibiu` | Pudelek, CC BY-SA 4.0 |
| Suceava | Rumanía | SCV | `ro-suceava` | Emil71, CC BY-SA 3.0 |
| Oradea | Rumanía | OMR | `ro-oradea` | Paralelogram, CC BY-SA 4.0 |
| Târgu Mureș | Rumanía | TGM | `ro-targu-mures` | lacihobo, CC BY-SA 4.0 |
| Craiova | Rumanía | CRA | `ro-craiova` | Sandri 90, CC BY-SA 3.0 |
| Brașov | Rumanía | GHV | `ro-brasov` | Victoras101, CC BY-SA 4.0 |
| Sofía | Bulgaria | SOF | `bg-sofia` | Plamen Agov (user:MrPanyGoff), CC BY-SA 4.0 |
| Varna | Bulgaria | VAR | `bg-varna` | Vladislav Bezrukov, CC BY 2.0 |
| Burgas | Bulgaria | BOJ | `bg-burgas` | Михал Орела, CC BY 3.0 |
| Plovdiv | Bulgaria | PDV | `bg-plovdiv` | MrPanyGoff, CC BY-SA 3.0 |
| Chisináu | Moldavia | RMO | `md-chisinau` | Tomasz Bladyniec, CC BY 4.0 |

## Criterios y fuentes

- Aeropuertos marcados como `airport` y `flightable=true` en el inventario de Travelpayouts (consulta del 6/11/2026; `tests/fixtures/eastern-europe-airport-provider.json`) y con tráfico regular de pasajeros conocido. `flightable=true` no prueba servicio actual: no se ha inventado ninguna ruta, precio ni disponibilidad.
- Bucarest agrupa por el código metropolitano BUH; el aeropuerto de la ficha es OTP (Henri Coandă).
- Fotos de Wikimedia Commons con licencia CC BY / CC BY-SA, con autor y enlace en cada ficha. La foto de Burgas es de Nesebar (cercana, a unos 35 km): marcada como mejorable en la fase 2 de imágenes.

## Excluidos o pendientes

| Código | Aeropuerto | Motivo |
|---|---|---|
| BBU | Bucarest Băneasa | Pendiente de verificar servicio comercial actual; la ficha de Bucarest usa OTP |
| CND | Constanța (Mihail Kogălniceanu) | Pendiente de verificar servicio comercial regular |
| BAY | Baia Mare | Pendiente de verificar |
| ARW | Arad | Pendiente de verificar |
| BCM | Bacău | Pendiente de verificar |
| SUJ | Satu Mare | Pendiente de verificar |
| BZY | Bălți (Moldavia) | Pendiente de verificar |

## Pruebas

Suite completa: 431 pruebas, 424 correctas y 7 fallos de entorno ya existentes (falta de dependencias: css-toolchain, página de vuelos, workflow diario, rutas mensuales asíncronas y 3 páginas de hoteles). No se ha podido ejecutar `next build` ni revisión visual (red desactivada; Preview de Vercel protegida): quedan pendientes.
