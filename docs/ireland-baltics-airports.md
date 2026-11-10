# Irlanda, bálticos, Luxemburgo y territorios: aeropuertos y fichas

Estado: borrador (`publication.status = 'draft'`). No aparecen en portada, sitemap ni recomendaciones automáticas; solo con selección explícita en el buscador. Las 16 tarjetas originales no se tocan.

## Fichas incluidas (17)

| Destino | País o territorio | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|---|
| Dublín | Irlanda | DUB | `ie-dublin` | Chris Morgan, CC BY-SA 2.0 |
| Cork | Irlanda | ORK | `ie-cork` | William Murphy, CC BY-SA 2.0 |
| Shannon (Clare) | Irlanda | SNN | `ie-shannon` | Höstblomma, CC BY 3.0 |
| Knock (Mayo) | Irlanda | NOC | `ie-knock` | Sinéad Mallee, CC BY-SA 4.0 |
| Kerry (Killarney) | Irlanda | KIR | `ie-kerry` | Jim Linwood, CC BY 2.0 |
| Tallin | Estonia | TLL | `ee-tallinn` | Guillaume Speurt, CC BY-SA 2.0 |
| Riga | Letonia | RIX | `lv-riga` | Diliff, CC BY-SA 3.0 |
| Vilna | Lituania | VNO | `lt-vilnius` | Bernt Rostad, CC BY 2.0 |
| Kaunas | Lituania | KUN | `lt-kaunas` | Lucas, CC BY-SA 2.0 |
| Palanga | Lituania | PLQ | `lt-palanga` | Zairon, CC BY-SA 4.0 |
| Luxemburgo | Luxemburgo | LUX | `lu-luxembourg` | Dguendel, CC BY 3.0 |
| Gibraltar | Gibraltar | GIB | `gi-gibraltar` | RedCoat, CC BY-SA 2.5 |
| Jersey | Jersey | JER | `je-jersey` | Paweł 'pbm' Szubert, CC BY-SA 3.0 |
| Guernsey | Guernsey | GCI | `gg-guernsey` | Steve Johnson, CC BY-SA 2.0 |
| Isla de Man | Isla de Man | IOM | `im-isle-of-man` | Lobster1, CC BY-SA 3.0 |
| Islas Feroe | Islas Feroe | FAE | `fo-faroe-islands` | DavideGorla, CC BY 2.0 |
| Islas Åland | Islas Åland | MHQ | `ax-aland` | Bahnfrend, CC BY-SA 4.0 |

## Criterios y fuentes

- Aeropuertos con `flightable=true` en el inventario de Travelpayouts (consulta del 6/11/2026; `tests/fixtures/ireland-baltics-airport-provider.json`) y con tráfico regular de pasajeros conocido. Esa marca no prueba servicio actual: no se ha inventado ninguna ruta, precio ni disponibilidad.
- Shannon, Knock y Kerry se presentan por la zona a la que dan servicio (Clare y acantilados de Moher, Mayo, Killarney); las fichas indican que hay que prever el traslado.
- Los territorios (Gibraltar, Jersey, Guernsey, Isla de Man, Islas Feroe y Åland) usan los códigos de país del proveedor. En Gibraltar la ficha pide comprobar los requisitos de documentación en la frontera con España, sin tomar postura sobre soberanía.
- Las islas indican que se llega en avión o ferry y que la oferta depende de la temporada; Islas Feroe avisa de que el tiempo puede afectar a vuelos y ferris, y la Isla de Man de la saturación durante las carreras del TT.
- Fotos de Wikimedia Commons (CC BY o CC BY-SA), con autor y enlace en cada ficha. Mejorables en la fase 2: Palanga, Luxemburgo y Shannon.

## Excluidos o pendientes (sin ficha)

| Código | Lugar | Motivo |
|---|---|---|
| CFN | Donegal (Irlanda) | Pendiente: servicio doméstico limitado, por verificar |
| TAY, KDL, URE | Tartu, Kärdla, Kuressaare (Estonia) | Pendientes: servicio limitado o estacional, por verificar |
| LPX | Liepāja (Letonia) | Pendiente de verificar |

## Prueba existente actualizada

La prueba «monthly rendering uses the country helper for a future country» usaba Irlanda como ejemplo de país aún no incluido; ahora usa Japón, porque Irlanda ya tiene fichas. No cambia ningún comportamiento.

## Pruebas

Suite completa: 464 pruebas, 457 correctas y 7 fallos de entorno ya existentes (faltan dependencias). No se ha podido ejecutar `next build` ni revisión visual (red desactivada; Preview de Vercel protegida): quedan pendientes.
