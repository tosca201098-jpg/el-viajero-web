# Polonia — fichas de destino (23 de octubre de 2026)

Doce fichas editoriales en siete idiomas con `publication.status: 'draft'`. No alteran las 16 tarjetas originales de portada, las páginas mensuales ni las estaciones. `lowSeasonMonths` significa demanda turística normalmente más tranquila, nunca precio garantizado. Los textos de transporte distinguen entre aeropuerto del destino y aeropuerto de acceso con continuación terrestre.

## Aeropuertos

Se consultó `places2` de Travelpayouts por cada código de la tabla (tipo ciudad/aeropuerto, locale `es`) y se comprobó que devuelve el aeropuerto polaco correspondiente. La existencia del código **no garantiza vuelos comerciales regulares**, rutas desde un origen determinado ni disponibilidad en las fechas elegidas. También se contrastaron las ubicaciones con el [Ministerio de Infraestructuras de Polonia](https://www.gov.pl/web/infrastruktura/porty-lotnicze), el [registro de la autoridad aeronáutica ULC](https://ulc.gov.pl/en/aerodromes/establishment-of-aerodromes-and-airstrips/register-of-aerodromes) y el [directorio de aeropuertos de la organización turística polaca](https://www.poland.travel/en/by-plane/). Los horarios y rutas deben consultarse en el operador y proveedor al planear el viaje.

| Ficha | Aeropuerto propio o del área | Acceso terrestre / cautela |
| --- | --- | --- |
| Varsovia | WAW (Chopin), WMI (Modlin) | Son aeropuertos distintos; comprobar el traslado desde cada uno. |
| Cracovia | KRK | Consultar conexión urbana actual. |
| Gdańsk, Sopot y Gdynia | GDN | Continuar por tierra a Sopot o Gdynia. |
| Breslavia | WRO | Consultar conexión urbana actual. |
| Poznań | POZ | Consultar conexión urbana actual. |
| Toruń | Ninguno | BZG (Bydgoszcz) como acceso, después transporte terrestre. |
| Lublin | LUZ | Oferta de vuelos variable; confirmar antes de reservar. |
| Łódź | LCJ | Oferta de vuelos variable; confirmar antes de reservar. |
| Zakopane y los Tatras | Ninguno | KRK o KTW y continuación terrestre; consultar condiciones del parque. |
| Lagos de Masuria | Ninguno | SZY (Olsztyn-Mazury) o WAW y continuación terrestre; SZY puede tener poca oferta. |
| Szczecin | SZZ (Goleniów) | El aeropuerto está fuera de la ciudad; comprobar el traslado y los vuelos disponibles. |
| Białowieża | Ninguno | WAW y continuación terrestre; no se promete una conexión directa. |

Los códigos `iataCodes` se utilizan solo para destinos con aeropuerto comercial propio o de su área. Los `accessAirports` se muestran como opciones separadas para destinos sin aeropuerto propio y nunca se asignan como su IATA turístico. La función de autocompletado conserva la consulta oficial de Travelpayouts y añade las fichas sin aeropuerto para que puedan seleccionarse.

## Espacios protegidos

El [Parque Nacional de los Tatras](https://tpn.gov.pl/) publica un [comunicado turístico actualizado](https://tpn.gov.pl/komunikat-turystyczny) y [restricciones de senderos](https://tpn.gov.pl/aktualnosci/ograniczenia-w-poruszaniu-sie-po-szlakach). La ficha pide seguir solo los senderos autorizados y verificar cierres, restricciones nocturnas y condiciones de montaña. No promete acceso permanente a Morskie Oko o a ningún sendero.

Las [normas oficiales del Parque Nacional de Białowieża](https://bpn.com.pl/index.php?Itemid=181&id=111&option=com_content&task=view) exigen permanecer en los itinerarios permitidos; el área de protección estricta requiere guía autorizado por el parque. También hay [información oficial en inglés](https://bpn.com.pl/index.php?Itemid=280&id=638&lang=en&option=com_content&task=view). La ficha recomienda revisar cierres y normas vigentes antes de viajar.

## Fotografías

`lib/destinations/poland-images.ts` conserva para cada una de las doce fichas: miniatura directa de Wikimedia Commons a 960 px, página del archivo original, autor, nombre de licencia CC BY o CC BY-SA y enlace a la licencia. Los datos se comprobaron en los metadatos `imageinfo/extmetadata` de Wikimedia Commons. No se eligieron archivos con cláusulas NC o ND. Las doce URL individuales respondieron `200` con `image/jpeg` en la verificación HTTP inicial; la comprobación visual en Preview queda registrada en la revisión de la PR.

## Pruebas de regresión

`tests/fixtures/pre-poland-catalog.json` registra el hash de las 173 fichas de `main` antes de añadir Polonia, además de la portada y las páginas mensuales y estacionales. `tests/poland-destinations.test.cjs` comprueba 185 IDs y slugs únicos, 12 países, la conservación exacta de los 173 perfiles, siete idiomas, cuatro recomendaciones por destino, aeropuertos y accesos separados, autocompletado, fotos con crédito y restricciones de los parques. Los tests existentes mantienen los recuentos globales actualizados.
