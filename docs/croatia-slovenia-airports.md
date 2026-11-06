# Croacia y Eslovenia: aeropuertos y fichas

Estado: borrador (`publication.status = 'draft'`). No aparecen en portada, sitemap ni recomendaciones automáticas; solo con selección explícita en el buscador. Las 16 tarjetas originales no se tocan.

## Fichas incluidas (7)

| Destino | País | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|---|
| Zagreb | Croacia | ZAG | `hr-zagreb` | Nikolai Karaneschev, CC BY 3.0 |
| Split | Croacia | SPU | `hr-split` | Following Hadrian, CC BY-SA 2.0 |
| Dubrovnik | Croacia | DBV | `hr-dubrovnik` | Bracodbk, CC BY-SA 3.0 |
| Zadar | Croacia | ZAD | `hr-zadar` | Rpuljiz, CC BY-SA 4.0 |
| Pula | Croacia | PUY | `hr-pula` | Carole Raddato, CC BY-SA 2.0 |
| Rijeka | Croacia | RJK | `hr-rijeka` | Laslovarga, CC BY-SA 3.0 |
| Liubliana | Eslovenia | LJU | `si-ljubljana` | Mihael Grmek, CC BY-SA 3.0 |

## Criterios y fuentes

- Aeropuertos con `flightable=true` en el inventario de Travelpayouts (consulta del 6/11/2026; `tests/fixtures/croatia-slovenia-airport-provider.json`) y con tráfico regular de pasajeros conocido. Esa marca no prueba servicio actual: no se ha inventado ninguna ruta, precio ni disponibilidad.
- Distancias aeropuerto–ciudad indicadas como aproximadas; el aeropuerto de Rijeka está en la isla de Krk.
- La costa croata tiene mucha estacionalidad: las fichas avisan de que la oferta de vuelos y servicios se reduce en invierno. La de Dubrovnik avisa de la saturación por cruceros en verano.
- Fotos de Wikimedia Commons (CC BY o CC BY-SA), con autor y enlace en cada ficha. Mejorables en la fase 2: Zadar (Órgano Marino), Rijeka (Trsat) y Liubliana (orilla del río).

## Excluidos o pendientes (sin ficha)

| Código | Lugar | Motivo |
|---|---|---|
| OSI | Osijek | Pendiente: servicio limitado, por verificar |
| BWK | Brač | Pendiente: servicio estacional, por verificar |
| POW, MBX | Portorož, Maribor | Pendientes: servicio limitado, por verificar |

Grecia va en el lote siguiente. Santorini (JTR) es una de las 16 tarjetas originales y no se duplica como ficha del catálogo.

## Pruebas

Suite completa: 475 pruebas, 468 correctas y 7 fallos de entorno ya existentes (faltan dependencias). No se ha podido ejecutar `next build` ni revisión visual (red desactivada; Preview de Vercel protegida): quedan pendientes.
