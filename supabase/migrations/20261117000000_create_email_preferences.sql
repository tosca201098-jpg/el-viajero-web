-- Gustos de viaje y permiso para recibir correos (cuestionario de «Mi cuenta»).
-- Una fila por cuenta. Cada persona solo ve y cambia la suya (RLS). No envía nada: solo guarda lo que la persona elige.
-- Las listas de valores permitidos coinciden con lib/email-preferences/options.ts (una prueba lo comprueba).
begin;

create table public.email_preferences (
  user_id uuid primary key default auth.uid()
    references auth.users(id) on delete cascade,

  -- Aeropuertos de salida (los mismos que «Viajes por mes»): hasta 2.
  airports text[] not null default '{}',
  -- Meses preferidos para viajar (1 a 12): hasta 4.
  months smallint[] not null default '{}',
  -- Tipo de viaje preferido: hasta 3.
  trip_types text[] not null default '{}',
  trip_length text,
  reach text,
  flight_budget text,
  frequency text,
  -- Idioma en el que la persona verá los correos (el de la web al guardar).
  locale text not null default 'es',

  -- Permiso para recibir correos. Las fechas y la versión del texto las fija la base de datos (ver el disparador).
  email_consent boolean not null default false,
  consent_version text,
  consent_given_at timestamptz,
  consent_withdrawn_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint email_preferences_airports_valid check (
    airports <@ array['MAD','BCN','VLC','SVQ','AGP','BIO','PMI','ALC','TCI','LPA']::text[]
    and array_position(airports, null) is null
    and cardinality(airports) <= 2
  ),
  constraint email_preferences_months_valid check (
    months <@ array[1,2,3,4,5,6,7,8,9,10,11,12]::smallint[]
    and array_position(months, null) is null
    and cardinality(months) <= 4
  ),
  constraint email_preferences_trip_types_valid check (
    trip_types <@ array['beach','city','mountain','gastronomy','adventure','relax']::text[]
    and array_position(trip_types, null) is null
    and cardinality(trip_types) <= 3
  ),
  constraint email_preferences_trip_length_valid check (
    trip_length is null or trip_length in ('weekend','short','week')
  ),
  constraint email_preferences_reach_valid check (
    reach is null or reach in ('spain','europe','far','any')
  ),
  constraint email_preferences_flight_budget_valid check (
    flight_budget is null or flight_budget in ('up100','up200','up400','any')
  ),
  constraint email_preferences_frequency_valid check (
    frequency is null or frequency in ('weekly','fortnightly','monthly')
  ),
  constraint email_preferences_locale_valid check (
    locale in ('es','en','fr','de','it','pt','ca')
  ),
  constraint email_preferences_consent_version_valid check (
    consent_version is null or length(consent_version) between 1 and 40
  ),
  -- Sin aeropuerto no hay precios reales que enviar y sin frecuencia no se sabe cuándo: el permiso exige ambos.
  constraint email_preferences_consent_complete check (
    not email_consent
    or (cardinality(airports) >= 1 and frequency is not null and consent_version is not null)
  )
);

comment on table public.email_preferences is
  'Gustos de viaje y permiso de correo de cada cuenta. La fecha y la versión del permiso las fija email_preferences_stamp().';

-- Fechas del permiso: las pone la base de datos, no el navegador.
create function public.email_preferences_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();

  if tg_op = 'INSERT' then
    new.created_at := now();
    new.consent_withdrawn_at := null;
    if new.email_consent then
      new.consent_given_at := now();
    else
      new.consent_given_at := null;
      new.consent_version := null;
    end if;
    return new;
  end if;

  -- UPDATE: la cuenta y la fecha de alta no cambian.
  new.user_id := old.user_id;
  new.created_at := old.created_at;

  if new.email_consent and not old.email_consent then
    -- Permiso nuevo (o vuelto a dar): fecha de ahora y la versión del texto que se mostró.
    new.consent_given_at := now();
    new.consent_withdrawn_at := null;
  elsif new.email_consent then
    -- Sigue con permiso: se conservan la fecha y la versión con las que lo dio.
    new.consent_given_at := old.consent_given_at;
    new.consent_version := old.consent_version;
    new.consent_withdrawn_at := null;
  elsif old.email_consent then
    -- Retira el permiso: queda anotada la fecha y se conserva la del permiso anterior como prueba.
    new.consent_given_at := old.consent_given_at;
    new.consent_version := old.consent_version;
    new.consent_withdrawn_at := now();
  else
    -- Sigue sin permiso: no cambia nada del registro del permiso.
    new.consent_given_at := old.consent_given_at;
    new.consent_version := old.consent_version;
    new.consent_withdrawn_at := old.consent_withdrawn_at;
  end if;
  return new;
end;
$$;

create trigger email_preferences_stamp
  before insert or update on public.email_preferences
  for each row execute function public.email_preferences_stamp();

alter table public.email_preferences enable row level security;

-- Eliminar permisos que pudieran concederse por defecto.
revoke all privileges on table public.email_preferences
  from public, anon, authenticated;

-- Solo las columnas que la persona puede escribir; las fechas del permiso las pone el disparador.
grant select on table public.email_preferences to authenticated;
grant insert (user_id, airports, months, trip_types, trip_length, reach, flight_budget, frequency, locale,
              email_consent, consent_version)
  on table public.email_preferences to authenticated;
grant update (user_id, airports, months, trip_types, trip_length, reach, flight_budget, frequency, locale,
              email_consent, consent_version)
  on table public.email_preferences to authenticated;
grant delete on table public.email_preferences to authenticated;

create policy email_preferences_select_own
  on public.email_preferences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy email_preferences_insert_own
  on public.email_preferences
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy email_preferences_update_own
  on public.email_preferences
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy email_preferences_delete_own
  on public.email_preferences
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

commit;
