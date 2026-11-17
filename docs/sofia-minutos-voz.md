# Sofía: minutos de voz por cuenta y periodo

Sustituye a la regla anterior («3 conversaciones por día natural de Madrid y 360 segundos»). Decisión del propietario
(17 de noviembre de 2026): **6 minutos por mes natural y cuenta registrada**, de uso libre (si una persona gasta 2 minutos en su primera
conversación, los 4 restantes se quedan guardados en su cuenta para el resto del mes; no hay una «conversación única»), y una barra en
«Mi cuenta» que enseña cuánto queda. Con 6 minutos cada conversación dura como mucho 6 minutos, que es justo lo que corta el agente
ya fijado (360 s). Antes se estudiaron 10 minutos por semana y 20 por mes; el código admite otras cifras (ver variables). El propietario irá ajustando las cifras con los días y las semanas según el consumo real y su plan de
ElevenLabs; por eso el periodo y los minutos se cambian desde Vercel, sin tocar código.

## Cómo funciona

- **Periodo de la cuenta** (`AI_VOICE_PERIOD`, por defecto `month`):
  - `month`: mes natural de Madrid, del día 1 a las 00:00 al día 1 del mes siguiente a las 00:00.
  - `fortnight`: bloques de 14 días que empiezan un lunes, contados desde el lunes 16 de noviembre de 2026.
  - `week`: lunes 00:00 a lunes 00:00.

  Siempre en hora de Madrid y con los cambios de hora de marzo y octubre bien resueltos (no se usan ventanas «móviles» de 24 horas × N).
  Al cambiar de periodo, la cuenta vuelve a tener todos sus minutos. Los minutos no gastados **no se acumulan** para el periodo siguiente.
- **Minutos reales, no estimados**: antes de dar un token, la web pregunta a ElevenLabs por las conversaciones del periodo
  (`GET /v1/convai/conversations`) y suma `call_duration_secs`. Una conversación en curso cuenta lo que lleva (máximo 15 minutos) en la barra de «Mi cuenta»; para conceder minutos nuevos reserva su duración máxima (ver «Varias conversaciones a la vez»).
  Varias conversaciones cortas suman igual que una larga.
- **Por cuenta**: el navegador pasa a ElevenLabs un identificador anónimo (`u_` + 32 caracteres hexadecimales, HMAC del usuario
  verificado con `AI_RATE_LIMIT_SECRET`). No contiene el correo ni el identificador de Supabase y no se puede deducir de él. ElevenLabs
  lo guarda como `user_id` de la conversación.
- **Para toda la web**: además hay un tope **semanal** compartido (`AI_VOICE_GLOBAL_WEEK_MINUTES`, lunes a lunes) que suma todas las
  conversaciones del agente (también las pruebas hechas desde el panel de ElevenLabs). Protege el plan de ElevenLabs aunque haya muchas
  cuentas con minutos.
- **Duración de cada conversación**: lo menor entre lo que le queda a la cuenta, lo que queda en el tope semanal de la web y 15 minutos.
  El navegador corta la conversación al terminar ese tiempo. Con menos de 30 segundos disponibles se considera «sin minutos».
- **Si no se puede leer el consumo** (ElevenLabs no responde, clave sin permiso, respuesta rara, variable mal escrita) la voz queda en
  pausa (503) y nadie recibe un token: nunca se concede «por si acaso».

## Qué ve la persona

| Situación | Respuesta del servidor | Mensaje |
| --- | --- | --- |
| Quedan minutos | token + `sessionSeconds` + `remainingSeconds` + `limitSeconds` + `period` + `resetsAt` + `userRef` | habla; se corta al acabar su tiempo |
| Cuenta sin minutos | 429 `ai_minutes_limit` + `resetsAt` | «Has usado todos tus minutos de voz. En tu cuenta puedes ver cuándo se renuevan…» |
| Web sin minutos esta semana | 429 `ai_site_weekly_limit` | «La voz de Sofía ha llegado a su límite de esta semana…» |
| Demasiados intentos seguidos | 429 `ai_rate_limited` | mensaje general de límite temporal |
| Lectura imposible | 503 `ai_unavailable` | «La IA está temporalmente pausada…» |

Los mensajes están en los siete idiomas y no nombran el periodo (así valen para semana, quincena o mes). Vuelos, hoteles y destinos
siguen disponibles siempre.

**Barra de «Mi cuenta»** (`app/components/VoiceMinutesBar.tsx`, datos de `GET /api/voice/minutes`): barra que se vacía según se gasta
(azul; ámbar con un cuarto o menos; roja sin minutos), «Te quedan 4 min de 6 min» y «Se renuevan el martes 1 de diciembre, 00:00».
Es de solo lectura: no abre conversaciones, no devuelve tokens y solo da los segundos de la propia cuenta.

## Varias conversaciones a la vez (hasta 6)

El plan de ElevenLabs del propietario permite hasta 6 llamadas simultáneas. La web acepta un agente configurado con **de 1 a 6**
conversaciones a la vez (nunca más, ni con ráfagas ni con cola de espera: ambas deben seguir desactivadas). El límite real lo aplica
ElevenLabs; la web solo comprueba que el ajuste del agente está dentro de ese rango antes de dar permiso para hablar.

**Cómo se cuidan los minutos cuando hay varias a la vez.** Antes de dar el permiso, la web ya no se fía solo de lo que se ha hablado: cada
conversación **en curso** (estado `initiated` o `in-progress`) **reserva la duración máxima del agente** (360 s en la versión fijada; la web la
lee del agente y solo acepta 300, 360 o 900 s). Así dos personas que piden hablar casi a la vez no reciben los mismos minutos:

- Con el tope de la web en 15 minutos por semana y conversaciones de 6 minutos, la primera recibe 6 minutos, la segunda otros 6, la tercera
  solo los 3 que quedan y la cuarta ve «sin minutos». En total, nunca más de 15.
- La misma cuenta abierta en dos sitios a la vez tampoco puede gastar sus minutos dos veces: mientras una conversación está en curso, la
  otra ve la cuenta como «sin minutos».
- Cuando una conversación termina, deja de reservar y pasa a contar lo que duró de verdad (si habló 2 de 6 minutos, se liberan 4).
- Una fila que lleva «en curso» más tiempo del máximo del agente más 2 minutos de margen se considera atascada y deja de reservar.
- La barra de «Mi cuenta» **no** cuenta reservas, solo el tiempo realmente usado.

**Límite que queda (muy pequeño).** Si varias personas piden permiso en el mismo par de segundos, antes de que ElevenLabs liste sus
conversaciones, todas podrían recibir el mismo saldo. Está acotado por tres cosas: el agente solo admite 6 conversaciones a la vez, el
límite diario del agente en Production es de 15 conversaciones, y cada conversación dura como mucho lo que corta el agente (6 minutos). El
tope semanal de la web sigue protegiendo lo demás, y se recomienda no subirlo más de lo que el plan soporte.

## Frenos que se mantienen (solo contra ráfagas)

Ya no hay topes de conversaciones por día ni por web. Quedan estos contadores de intentos (no cuentan minutos; un intento que no llega a
conectar no gasta nada):

| Contador | Valor | Ajuste (solo puede bajar) |
| --- | --- | --- |
| Por IP y minuto | 6 | `AI_VOICE_IP_MINUTE_ATTEMPTS` |
| Por IP y día | 60 | `AI_VOICE_IP_DAY_ATTEMPTS` |
| Por cuenta y minuto | 3 | `AI_VOICE_USER_MINUTE_ATTEMPTS` |
| Lectura de la barra: por IP / por cuenta y minuto | 30 / 6 | (fijos) |

Las variables antiguas `AI_VOICE_MINUTE_LIMIT`, `AI_VOICE_DAY_LIMIT`, `AI_VOICE_GLOBAL_DAY_LIMIT` y `AI_VOICE_USER_MINUTE_LIMIT` **ya no se
leen**: si siguen en Vercel (Production tiene `AI_VOICE_DAY_LIMIT=5` y `AI_VOICE_GLOBAL_DAY_LIMIT=20`) no hacen nada y conviene borrarlas.
El libro de «3 conversaciones por día» (`VOICE_DAY_LEDGER_LUA`) ya no se usa en la voz; se conserva con sus pruebas solo como referencia.
Los itinerarios con IA no cambian.

## Variables (todas opcionales)

| Variable | Valor por defecto | Valores admitidos | Para qué |
| --- | --- | --- | --- |
| `AI_VOICE_PERIOD` | `month` | `week`, `fortnight`, `month` | Periodo en el que cada cuenta dispone de sus minutos. |
| `AI_VOICE_USER_MINUTES` | 6 | 1 a 300 | Minutos por cuenta y periodo. |
| `AI_VOICE_GLOBAL_WEEK_MINUTES` | 15 | 1 a 1000 | Minutos **por semana** para toda la web. **Lo decide el propietario** según su plan de ElevenLabs (el plan Starter incluye 75 minutos de agente al mes, unos 17 por semana; el siguiente, 275 al mes, unos 63 por semana; cada minuto de más tiene un coste que activa el propietario). |

Un valor mal escrito (no numérico, 0, negativo, decimal, por encima del tope o un periodo desconocido) deja la voz en pausa (503, código
`VOICE_BUDGET_CONFIG`) en lugar de elegir otro. `AI_VOICE_USER_WEEK_MINUTES` (nombre de la primera versión, nunca publicada) ya no se lee.

**Ejemplo de cuentas** (a título orientativo; el consumo real lo marca ElevenLabs): con 6 minutos por cuenta y mes y el tope de la web en
15 minutos por semana, caben unas 2 cuentas por semana (unas 10 al mes) si cada una gasta todo su saldo; un plan de 75 minutos al mes daría
como máximo para unas 12 cuentas, y el de 275 minutos para unas 45. Si la gente habla menos, caben más. Cuando el tope semanal de la web se
agota, nadie puede abrir una conversación hasta el lunes aunque le queden minutos a su cuenta.

## Lo que hay que hacer en ElevenLabs (lo hace el propietario)

1. **Con 6 minutos por cuenta no hace falta tocar la duración del agente**: la versión ya fijada (360 s = 6 minutos) encaja. Solo si algún día se
   suben los minutos por cuenta y se quieren conversaciones más largas habría que poner **900 segundos** en el agente (rama
   `sofia-agente-viajes`), publicar y fijar el `agtvrsn_…` nuevo en `lib/voice/preview-target.ts` (otra PR). El código ya acepta 900, 360 y (solo en
   Production) 300 segundos.
2. La clave de API del servidor necesita poder **leer conversaciones** (`GET /v1/convai/conversations`). Si no puede, la voz queda en pausa con el
   diagnóstico `VOICE_BUDGET_CREDENTIALS`.
3. Comprobar tras la primera conversación de prueba que en ElevenLabs → Conversaciones aparece el **usuario `u_…`** y que la barra de
   «Mi cuenta» baja. Si no aparece, el consumo por cuenta no se estaría atribuyendo (el tope de la web seguiría protegiendo).
4. Dejar **desactivados** los minutos extra y la recarga automática de ElevenLabs hasta decidir otra cosa.
5. **Para usar varias conversaciones a la vez**: en los ajustes del agente subir el límite de conversaciones simultáneas (de 1 hasta 6, empezar por 2 o 3), dejar **sin ráfagas** y **sin cola de espera**, y comprobar en la primera prueba con dos personas que ambas conectan. Mientras el agente siga en 1, todo funciona como antes.

## Límites conocidos

- El corte a los minutos concedidos lo hace el navegador (y el agente corta a su duración máxima, 360 s en la versión fijada). Una persona técnica podría seguir hablando hasta ese máximo del agente;
  después la cuenta quedaría sin minutos y el tope semanal de toda la web sigue vigente. La atribución por cuenta también depende del navegador.
- Si todas las conversaciones simultáneas del agente están ocupadas (hasta 6; ver «Varias conversaciones a la vez»), la siguiente persona no puede conectar hasta que se libere una.
- Más de 500 conversaciones en un periodo (cuenta o web) se consideran «sin minutos».
- El consumo se lee de ElevenLabs en cada intento, así que cada intento hace dos lecturas más (cuenta y web); la barra hace una.
- Los minutos no gastados no pasan al periodo siguiente.
