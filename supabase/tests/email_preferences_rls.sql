-- SOLO para una base local/de pruebas con la migracion ya aplicada.
-- Ejecutar con el runner pgTAP de Supabase: supabase test db.
-- No ejecutar en el proyecto alojado de Supabase sin autorizacion.
-- Los usuarios y preferencias siguientes son fixtures temporales: ROLLBACK los elimina.
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;
grant usage on schema extensions to anon, authenticated;

select plan(63);

select has_table('public', 'email_preferences', 'Existe email_preferences');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.email_preferences'::regclass),
  'RLS esta activado'
);

-- Preparacion administrativa de identidades; las comprobaciones usan roles API.
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'email-prefs-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'email-prefs-b@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is(auth.uid(), '11111111-1111-4111-8111-111111111111'::uuid, 'Sesion del usuario A');

-- ---------------------------------------------------------------- Alta y propiedad
select lives_ok($$
  insert into public.email_preferences (months, locale) values ('{3,9}', 'fr')
$$, 'A crea sus preferencias omitiendo user_id y sin permiso de correo');
select is(
  (select user_id from public.email_preferences),
  auth.uid(), 'user_id toma la identidad autenticada'
);
select ok(
  (select not email_consent and consent_given_at is null and consent_version is null
          and consent_withdrawn_at is null
   from public.email_preferences),
  'Sin permiso no hay fecha ni version del permiso'
);
select throws_ok($$
  insert into public.email_preferences (user_id) values ('22222222-2222-4222-8222-222222222222')
$$, '42501', null, 'A no puede crear preferencias para B');

-- ---------------------------------------------------------------- Las fechas del permiso las pone la base de datos
select throws_ok($$
  update public.email_preferences set consent_given_at = now()
$$, '42501', null, 'A no puede escribir la fecha en que dio el permiso');
select throws_ok($$
  update public.email_preferences set consent_withdrawn_at = now()
$$, '42501', null, 'A no puede escribir la fecha en que lo retiro');
select throws_ok($$
  insert into public.email_preferences (user_id, email_consent, consent_given_at)
  values ('11111111-1111-4111-8111-111111111111', true, now())
$$, '42501', null, 'A no puede crear una fila con fecha de permiso inventada');

-- ---------------------------------------------------------------- Valores no permitidos
select throws_ok($$update public.email_preferences set airports = '{XXX}'$$,
  '23514', null, 'Aeropuerto desconocido rechazado');
select throws_ok($$update public.email_preferences set airports = '{MAD,BCN,VLC}'$$,
  '23514', null, 'Mas de 2 aeropuertos rechazado');
select throws_ok($$update public.email_preferences set airports = array['MAD', null]$$,
  '23514', null, 'Aeropuerto vacio dentro de la lista rechazado');
select throws_ok($$update public.email_preferences set months = '{13}'$$,
  '23514', null, 'Mes 13 rechazado');
select throws_ok($$update public.email_preferences set months = '{0}'$$,
  '23514', null, 'Mes 0 rechazado');
select throws_ok($$update public.email_preferences set months = '{1,2,3,4,5}'$$,
  '23514', null, 'Mas de 4 meses rechazado');
select throws_ok($$update public.email_preferences set trip_types = '{foo}'$$,
  '23514', null, 'Tipo de viaje desconocido rechazado');
select throws_ok($$update public.email_preferences set trip_types = '{beach,city,mountain,gastronomy}'$$,
  '23514', null, 'Mas de 3 tipos de viaje rechazado');
select throws_ok($$update public.email_preferences set trip_length = 'x'$$,
  '23514', null, 'Duracion desconocida rechazada');
select throws_ok($$update public.email_preferences set reach = 'x'$$,
  '23514', null, 'Alcance desconocido rechazado');
select throws_ok($$update public.email_preferences set flight_budget = 'x'$$,
  '23514', null, 'Presupuesto desconocido rechazado');
select throws_ok($$update public.email_preferences set frequency = 'x'$$,
  '23514', null, 'Frecuencia desconocida rechazada');
select throws_ok($$update public.email_preferences set locale = 'ru'$$,
  '23514', null, 'Idioma no soportado rechazado');

-- ---------------------------------------------------------------- Permiso de correo
select throws_ok($$
  update public.email_preferences set email_consent = true, consent_version = 'v1'
$$, '23514', null, 'No se puede dar el permiso sin aeropuerto ni frecuencia');
select lives_ok($$
  update public.email_preferences
  set airports = '{MAD}', frequency = 'weekly', email_consent = true, consent_version = 'v1'
$$, 'A da el permiso con aeropuerto y frecuencia');
select ok(
  (select email_consent and consent_given_at is not null and consent_version = 'v1'
          and consent_withdrawn_at is null
   from public.email_preferences),
  'Quedan anotadas la fecha y la version del permiso'
);

-- now() no cambia dentro de una transaccion: se retrasan las fechas (con el disparador apagado
-- solo para preparar la prueba) para poder comprobar que se conservan o se renuevan.
reset role;
alter table public.email_preferences disable trigger email_preferences_stamp;
update public.email_preferences
  set consent_given_at = '2020-01-01 00:00:00+00', updated_at = '2020-01-01 00:00:00+00'
  where user_id = '11111111-1111-4111-8111-111111111111';
alter table public.email_preferences enable trigger email_preferences_stamp;
set local role authenticated;

select lives_ok($$
  update public.email_preferences set frequency = 'monthly', consent_version = 'v2'
$$, 'A cambia otros datos con el permiso activo (aunque envie otra version)');
select ok(
  (select consent_given_at = '2020-01-01 00:00:00+00'::timestamptz and consent_version = 'v1'
          and consent_withdrawn_at is null
   from public.email_preferences),
  'El permiso conserva la fecha y la version con las que se dio'
);
select ok(
  (select updated_at > '2020-01-01 00:00:00+00'::timestamptz from public.email_preferences),
  'updated_at se renueva en cada cambio'
);

select lives_ok($$
  update public.email_preferences set email_consent = false
$$, 'A retira el permiso');
select ok(
  (select not email_consent and consent_withdrawn_at is not null
          and consent_given_at = '2020-01-01 00:00:00+00'::timestamptz and consent_version = 'v1'
   from public.email_preferences),
  'Al retirarlo queda la fecha de retirada y se conserva la prueba del permiso anterior'
);
select lives_ok($$
  update public.email_preferences set trip_length = 'week', consent_version = null
$$, 'A edita sus gustos sin permiso');
select ok(
  (select consent_withdrawn_at is not null and consent_given_at = '2020-01-01 00:00:00+00'::timestamptz
          and consent_version = 'v1'
   from public.email_preferences),
  'Editar sin permiso no borra la prueba del permiso anterior'
);
select throws_ok($$
  update public.email_preferences set email_consent = true, consent_version = null
$$, '23514', null, 'No se puede volver a dar el permiso sin indicar la version del texto');
select lives_ok($$
  update public.email_preferences set email_consent = true, consent_version = 'v2'
$$, 'A vuelve a dar el permiso');
select ok(
  (select email_consent and consent_given_at > '2020-01-01 00:00:00+00'::timestamptz
          and consent_version = 'v2' and consent_withdrawn_at is null
   from public.email_preferences),
  'Al volver a darlo se renueva la fecha y la version y se borra la de retirada'
);

-- ---------------------------------------------------------------- Guardar con upsert (lo que hace la web)
select lives_ok($$
  insert into public.email_preferences (user_id, airports, frequency, email_consent, consent_version)
  values (auth.uid(), '{BCN}', 'weekly', true, 'v9')
  on conflict (user_id) do update set
    airports = excluded.airports, frequency = excluded.frequency,
    email_consent = excluded.email_consent, consent_version = excluded.consent_version
$$, 'Upsert con el permiso ya dado');
select ok(
  (select airports = '{BCN}' and consent_version = 'v2' and email_consent
   from public.email_preferences),
  'El upsert cambia los gustos pero no la version con la que se dio el permiso'
);
select lives_ok($$
  insert into public.email_preferences (user_id, airports, frequency, email_consent, consent_version)
  values (auth.uid(), '{BCN}', 'weekly', false, null)
  on conflict (user_id) do update set
    airports = excluded.airports, frequency = excluded.frequency,
    email_consent = excluded.email_consent, consent_version = excluded.consent_version
$$, 'Upsert retirando el permiso');
select ok(
  (select not email_consent and consent_withdrawn_at is not null and consent_version = 'v2'
   from public.email_preferences),
  'El upsert que retira el permiso anota la retirada y conserva la version anterior'
);
select lives_ok($$
  update public.email_preferences set email_consent = true, consent_version = 'v2'
$$, 'A vuelve a dar el permiso tras el upsert');

-- ---------------------------------------------------------------- B no puede tocar lo de A
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select is(auth.uid(), '22222222-2222-4222-8222-222222222222'::uuid, 'Sesion del usuario B');
select is(
  (select count(*) from public.email_preferences where user_id = '11111111-1111-4111-8111-111111111111'),
  0::bigint, 'B no ve las preferencias de A'
);
select throws_ok($$
  insert into public.email_preferences (user_id, email_consent, consent_given_at)
  values ('22222222-2222-4222-8222-222222222222', true, now())
$$, '42501', null, 'B tampoco puede inventar la fecha del permiso al crear su fila');
select lives_ok($$
  insert into public.email_preferences (airports, frequency, email_consent, consent_version)
  values ('{MAD}', 'monthly', true, 'v1')
$$, 'B crea sus preferencias con permiso desde el primer guardado');
select ok(
  (select email_consent and consent_given_at is not null and consent_version = 'v1'
   from public.email_preferences),
  'Al crear con permiso tambien se anota la fecha y la version'
);
with changed as (
  update public.email_preferences set frequency = 'weekly'
  where user_id = '11111111-1111-4111-8111-111111111111' returning user_id
)
select is((select count(*) from changed), 0::bigint, 'B no puede modificar las preferencias de A');
with removed as (
  delete from public.email_preferences
  where user_id = '11111111-1111-4111-8111-111111111111' returning user_id
)
select is((select count(*) from removed), 0::bigint, 'B no puede eliminar las preferencias de A');
select lives_ok($$
  update public.email_preferences set user_id = '11111111-1111-4111-8111-111111111111'
$$, 'B intenta pasar su fila a la cuenta de A');
select is(
  (select count(*) from public.email_preferences where user_id = '22222222-2222-4222-8222-222222222222'),
  1::bigint, 'La fila de B sigue siendo de B'
);

-- ---------------------------------------------------------------- Vuelta a A
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select ok(
  (select airports = '{BCN}' and frequency = 'weekly' and email_consent
   from public.email_preferences where user_id = '11111111-1111-4111-8111-111111111111'),
  'Los datos de A no cambiaron por lo que intento B'
);
select is(
  (select count(*) from public.email_preferences where user_id = '22222222-2222-4222-8222-222222222222'),
  0::bigint, 'A no ve las preferencias de B'
);

-- ---------------------------------------------------------------- Sin sesion
reset role;
set local role anon;
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{}';

select is(auth.uid(), null::uuid, 'Sin sesion no hay identidad');
select throws_ok($$select * from public.email_preferences$$,
  '42501', null, 'anon no puede consultar preferencias');
select throws_ok($$
  insert into public.email_preferences (user_id) values ('11111111-1111-4111-8111-111111111111')
$$, '42501', null, 'anon no puede crear preferencias');
select throws_ok($$update public.email_preferences set frequency = 'weekly'$$,
  '42501', null, 'anon no puede modificar preferencias');
select throws_ok($$delete from public.email_preferences$$,
  '42501', null, 'anon no puede eliminar preferencias');

-- Incluso con rol authenticated, sin sub no se obtiene acceso a filas.
reset role;
set local role authenticated;
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{}';

select is((select count(*) from public.email_preferences), 0::bigint,
  'authenticated sin identidad no ve preferencias');
select throws_ok($$
  insert into public.email_preferences (user_id) values ('11111111-1111-4111-8111-111111111111')
$$, '42501', null, 'authenticated sin identidad no puede crear preferencias');
with removed as (delete from public.email_preferences returning user_id)
select is((select count(*) from removed), 0::bigint,
  'authenticated sin identidad no puede eliminar preferencias');

-- ---------------------------------------------------------------- Borrar la propia fila y borrar la cuenta
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

with removed as (
  delete from public.email_preferences
  where user_id = '11111111-1111-4111-8111-111111111111' returning user_id
)
select is((select count(*) from removed), 1::bigint, 'A puede eliminar sus propias preferencias');

reset role;
select is(
  (select count(*) from public.email_preferences where user_id = '22222222-2222-4222-8222-222222222222'),
  1::bigint, 'Los intentos de A y de los usuarios sin sesion no eliminaron las de B'
);
delete from auth.users where id = '22222222-2222-4222-8222-222222222222';
select is(
  (select count(*) from public.email_preferences where user_id = '22222222-2222-4222-8222-222222222222'),
  0::bigint, 'Al borrar la cuenta se borran sus preferencias'
);

select * from finish();
rollback;
