-- Registro de los correos de vuelos enviados a cada cuenta. Sirve para dos cosas: saber cuándo le toca el siguiente (según su
-- frecuencia) y no enviar dos veces el mismo día aunque la tarea se ejecute dos veces.
-- Es una tabla PRIVADA: solo la lee y escribe el servidor con la clave de servicio. Ninguna cuenta (ni la propia) puede verla.
-- No guarda correos electrónicos ni el contenido del mensaje: solo la cuenta, el aeropuerto, los meses y el estado.
-- Esta Pull Request solo la LEE; la escritura llega con el envío automático (parte 3).
begin;

create table public.email_sends (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'flights',
  -- Día (UTC) del envío: junto con la cuenta y el tipo, impide enviar dos veces el mismo día.
  send_day date not null default ((now() at time zone 'utc')::date),
  origin text not null,
  months smallint[] not null default '{}',
  -- claimed = reservado antes de enviar; sent = Resend lo aceptó; failed = Resend lo rechazó (se reintenta otro día).
  status text not null default 'claimed',
  provider_id text,
  claimed_at timestamptz not null default now(),
  sent_at timestamptz,

  constraint email_sends_kind_valid check (kind in ('flights')),
  constraint email_sends_status_valid check (status in ('claimed', 'sent', 'failed')),
  constraint email_sends_origin_valid check (origin ~ '^[A-Z]{3}$'),
  constraint email_sends_months_valid check (
    months <@ array[1,2,3,4,5,6,7,8,9,10,11,12]::smallint[]
    and array_position(months, null) is null
    and cardinality(months) <= 4
  ),
  constraint email_sends_provider_id_valid check (provider_id is null or length(provider_id) <= 100),
  constraint email_sends_sent_has_date check (status <> 'sent' or sent_at is not null),
  constraint email_sends_one_per_day unique (user_id, kind, send_day)
);

comment on table public.email_sends is
  'Correos de vuelos enviados por cuenta y día. Tabla privada (solo clave de servicio): sin correos electrónicos ni contenido.';

create index email_sends_user_sent_idx on public.email_sends (user_id, sent_at desc) where status = 'sent';

alter table public.email_sends enable row level security;

-- Sin políticas y sin permisos para ninguna cuenta ni visitante: solo service_role (que se salta las reglas de acceso).
revoke all privileges on table public.email_sends from public, anon, authenticated;
revoke all privileges on sequence public.email_sends_id_seq from public, anon, authenticated;

commit;
