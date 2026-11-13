# Booking.com: compatibilidad e integración progresiva
Fecha de revisión pública: 2026-11-05. Estado: diseño pendiente de evidencia de cuenta; integración NO activada.

## Conclusión y fuentes oficiales
La documentación de Booking contempla comisión por alojamiento y vuelos. No permite deducir que la aprobación concreta del propietario incluya todos los productos, territorios o herramientas. No hay evidencia pública que obligue a contratar un programa separado en todos los casos; si vuelos no está habilitado, debe confirmarse con soporte de la cuenta si admite activación o necesita otra asociación. No solicitar ni contratar esa asociación automáticamente.

- [Commission and Payments](https://bookingcom.my.site.com/kb/s/article/Commission-and-Payments): incluye vuelos y reservas completadas; remite al esquema de comisión de la cuenta y al acuerdo vigente. No prometer tarifas ni atribución antes de comprobarlos.
- [My Partner Center](https://affiliates.support.booking.com/kb/s/article/My-Partner-Center): Marketplace muestra los productos disponibles para cada cuenta; Reports permite comprobar transacciones.
- [Choosing the Right Widget](https://affiliates.support.booking.com/kb/s/article/Choosing-the-Right-Widget-for-Your-Website): existen Affiliate Links y Search Box; las verticales admitidas dependen de la cuenta.

Los enlaces oficiales existen como herramienta general. No se ha verificado un enlace de vuelos generado para ESTA cuenta ni su contrato de parámetros. Añadir aid a una URL de vuelos, o que una página abra correctamente, NO demuestra atribución ni comisión.

## Revisión del código base
Base aislada: main, commit bbf31cbc9b560151cf2301bb7bed81b6f0f25c41. No parte de las ramas de #38, #39 o #42 ni las modifica.

- app/page.tsx y app/components/HotelDestinationLink.tsx conducen a /hoteles usando lib/stay22/hotels.ts. hotelsHref codifica destino, fechas, adultos, niños, bebés, habitaciones y moneda.
- app/hoteles/page.tsx recibe los datos; HotelsSearch.tsx valida y guarda una búsqueda enviada independiente de las ediciones. El mapa actual es Stay22 con aid destinauta; no sustituirlo globalmente ni reescribir sus enlaces.
- El mapa recibe seis idiomas; la interfaz admite es/en/fr/de/it/pt/ca y ya avisa de la alternativa castellana del mapa para catalán.
- app/api/travelpayouts/flight-link/route.ts resuelve ciudad/IATA y genera rutas locales a /vuelos o portada. lib/travelpayouts/white-label.ts valida fechas y viajeros. Portada y /vuelos cargan el white label 23773 de Travelpayouts.
- lib/travelpayouts/places.ts restringe enlaces de ofertas a HTTPS y dominios/rutas de Aviasales admitidos. Mantener esta protección y la afiliación existente.
Revisión estática, no certificación de funcionamiento del proveedor ni de comisiones reales.

## Fases
1. Verificar un enlace oficial de alojamiento, su identificador y las condiciones de cuenta. Conservar Stay22. Añadir una opción explícita de buscar en Booking en /hoteles, usando la búsqueda enviada (nunca campos editados aún sin enviar). No cargar scripts de conversión global de enlaces.
2. Implementar el contrato documentado del enlace aprobado: mantener parámetros de tracking intactos y transmitir ciudad/país, entrada/salida, moneda, adultos y habitaciones solo mediante parámetros oficialmente admitidos. Niños/bebés requieren edades: el formulario actual no las recoge. Añadir edades si el contrato lo exige; no inventarlas ni perder ocupantes silenciosamente. Si el enlace no permite búsqueda dinámica, conservar el flujo actual hasta disponer de una herramienta compatible.
3. Vuelos: activar Booking únicamente con producto habilitado, condiciones comisionables y enlace/herramienta oficial verificables. Mantener Travelpayouts como opción y alternativa por defecto mientras falte evidencia. No reutilizar el identificador de alojamiento como prueba de habilitación aérea. Una migración de búsqueda o precios requiere alcance y validación propios; no viene implícita con un enlace afiliado.
4. Validar en entorno de revisión y obtener autorización explícita para publicación. No fusionar ni cambiar Production, dominios, planes o contratos.

## Contrato de seguridad y aceptación para la implementación
- Configuración vacía por defecto, sin IDs ficticios ni secretos versionados. Solo identificador público/enlaces de tracking aprobados; credenciales privadas, si alguna herramienta las necesitara, exclusivamente en servidor y fuera del repositorio.
- Aceptar solo HTTPS y orígenes exactos del proveedor/red confirmados; rechazar credenciales en URL, javascript:, dominios parecidos y redirecciones arbitrarias. No construir un redirect abierto desde parámetros del visitante. No eliminar ni duplicar tracking de otras redes.
- Enlaces externos con rel="sponsored noopener noreferrer" y aviso de afiliación visible antes de pulsar. Traducir CTA y aviso en los siete idiomas; distinguir idioma del proveedor y alternativa admitida.
- Probar destinos con tildes, país y caracteres &; fechas inválidas/pasadas/bisiestas; salida posterior a entrada; cambios sin enviar; ocupación completa; regreso de vuelos y edición de fechas de llegada. Conservar presupuesto, fechas flexibles, IATA y selección por aeropuerto.
- Regresión: Stay22, Travelpayouts, fichas, búsqueda de portada, enlaces desde fichas y vuelos a hoteles, siete idiomas, móvil/tableta/ordenador. Ejecutar pruebas existentes y compilación cuando haya cambios ejecutables.
- Confirmar clic y destino conservando tracking; comprobar atribución con los informes o método de prueba oficial de Booking. Abrir una URL no prueba comisión. No efectuar compras para probar.

## Pendiente del propietario
Únicamente enlaces de tracking oficiales o identificador público verificable; para vuelos, texto del esquema de comisión/confirmación de soporte que acredite habilitación. No contraseñas ni tokens privados. Ninguna evidencia de cuenta recibida aún.

## Alojamiento comercial antes de publicar
Las previews y el README apuntan a Vercel, pero el repositorio no acredita el plan contratado. [Vercel Hobby](https://vercel.com/docs/plans/hobby) limita su uso a proyectos personales no comerciales. Verificar el plan real del proyecto y que permita afiliación antes de publicar. No se ha accedido a facturación ni modificado plan/configuración; no hay contratación autorizada.

## Validación de esta PR
Solo documentación. Revisión del código y fuentes oficiales; sin cambios ejecutables, dependencias, secretos, configuración o datos de destinos. No se han ejecutado pruebas ni compilación para este documento. La habilitación de cuenta, enlaces reales, atribución y plan comercial siguen pendientes.
