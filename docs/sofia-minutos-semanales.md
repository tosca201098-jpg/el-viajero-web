# Sofía: minutos de voz por semana y cuenta

Sustituye a la regla anterior («3 conversaciones por día natural de Madrid y 360 segundos»). Decisión del propietario
(16 de noviembre de 2026): **10 minutos por semana y cuenta registrada**, conversaciones de **hasta 15 minutos**, y una barra en
«Mi cuenta» que enseña cuánto queda.

## Cómo funciona

- **Semana natural de Madrid**: de lunes 00:00 a lunes 00:00 (hora de Madrid, con los cambios de hora de marzo y octubre; las semanas
  de esos cambios duran 167 o 169 horas, nunca «7 × 24»). El lunes a las 00:00 cada cuenta vuelve a tener todos sus minutos.
- **Minutos reales, no estimados**: antes de dar un token, la web pregunta a ElevenLabs por las conversaciones de esa semana
  (`GET /v1/convai/conversations`) y suma `call_duration_secs`. Una conversación en curso cuenta lo que lleva (máximo 15 minutos).
- **Por cuenta**: el navegador pasa a ElevenLabs un identificador anónimo (`u_` + 32 caracteres hexadecimales, HMAC del usuario
  verificado con `AI_RATE_LIMIT_SECRET`). No contiene el correo ni el identificador de Supabase y no se puede deducir de él. ElevenLabs
  lo guarda como `user_id` de la conversación.
- **Para toda la web**: además hay un tope semanal compartido (`AI_VOICE_GLOBAL_WEEK_MINUTES`) que suma todas las conversaciones del
  agente (también las pruebas hechas desde el panel de ElevenLabs).
- **Duración de cada conversación**: lo que quede de la semana de la cuenta y de la web, con un máximo de 15 minutos. El navegador corta
  la conversación al terminar ese tiempo. Con menos de 30 segundos disponibles se considera «sin minutos».
- **Si no se puede leer el consumo** (ElevenLabs no responde, clave sin permiso, respuesta rara) la voz queda en pausa (503) y nadie recibe
  un token: nunca se concede «por si acaso».

## Qué ve la persona

| Situación | Respuesta del servidor | Mensaje |
| --- | --- | --- |
| Quedan minutos | token + `sessionSeconds` + `userRef` | habla; se corta al acabar su tiempo |
| Cuenta sin minutos | 429 `ai_weekly_limit` + `resetsAt` | «Has usado tus minutos de voz de esta semana. Se renuevan el lunes…» |
| Web sin minutos | 429 `ai_site_weekly_limit` | «La voz de Sofía ha llegado a su límite de esta semana…» |
| Demasiados intentos seguidos | 429 `ai_rate_limited` | mensaje general de límite temporal |
| Lectura imposible | 503 `ai_unavailable` | «La IA está temporalmente pausada…» |

Los mensajes están en los siete idiomas. Vuelos, hoteles y destinos siguen disponibles siempre.

**Barra de «Mi cuenta»** (`app/components/VoiceMinutesBar.tsx`, datos de `GET /api/voice/minutes`): barra que se vacía según se gasta
(azul; ámbar con un cuarto o menos; roja sin minutos), «Te quedan 8 min 20 s de 10 min» y «Se renuevan el lunes 23 de noviembre, 00:00».
Es de solo lectura: no abre conversaciones, no devuelve tokens y solo da los segundos de la propia cuenta.

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

## Variables nuevas

| Variable | Valor por defecto | Tope | Para qué |
| --- | --- | --- | --- |
| `AI_VOICE_USER_WEEK_MINUTES` | 10 | 60 | Minutos por semana y cuenta. |
| `AI_VOICE_GLOBAL_WEEK_MINUTES` | 15 | 1000 | Minutos por semana para toda la web. **Lo decide el propietario** según su plan de ElevenLabs (el plan Starter incluye 75 minutos de agente al mes, unos 17 por semana; cada minuto de más tiene un coste que activa el propietario). |

Un valor no numérico, 0, negativo o por encima del tope deja la voz en pausa (503, código `VOICE_BUDGET_CONFIG`) en lugar de elegir otro.

## Lo que hay que hacer en ElevenLabs (lo hace el propietario)

1. En el agente (rama `sofia-agente-viajes`): **duración máxima de la conversación = 900 segundos** y publicar → saldrá un `agtvrsn_…` nuevo que
   habrá que fijar en `lib/voice/preview-target.ts` (otra PR). Hasta entonces el código sigue aceptando la versión de 360 s.
2. La clave de API del servidor necesita poder **leer conversaciones** (`GET /v1/convai/conversations`). Si no puede, la voz queda en pausa con el
   diagnóstico `VOICE_BUDGET_CREDENTIALS`.
3. Comprobar tras la primera conversación de prueba que en ElevenLabs → Conversaciones aparece el **usuario `u_…`**. Si no aparece, el
   consumo por cuenta no se estaría atribuyendo (el tope de la web seguiría protegiendo).

## Límites conocidos

- El corte a los minutos concedidos lo hace el navegador. Una persona técnica podría seguir hablando hasta los 15 minutos del agente;
  después la cuenta quedaría sin minutos y el tope semanal de toda la web sigue vigente. La atribución por cuenta también depende del navegador.
- Es una sola conversación a la vez en toda la web (el agente exige concurrencia 1): si alguien habla, el siguiente espera.
- Más de 500 conversaciones en una semana (cuenta o web) se consideran «sin minutos».
- El consumo se lee de ElevenLabs en cada intento, así que cada intento hace dos lecturas más (cuenta y web); la barra hace una.
