-- SOLO para una base local/de pruebas con la migracion ya aplicada.
-- Ejecutar con el runner pgTAP de Supabase: supabase test db.
-- No ejecutar en el proyecto alojado de Supabase sin autorizacion.
-- Los usuarios y viajes siguientes son fixtures temporales: ROLLBACK los elimina.
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;
grant usage on schema extensions to anon, authenticated;

select plan(28);

select has_table('public', 'saved_trips', 'Existe saved_trips');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.saved_trips'::regclass),
  'RLS esta activado'
);

-- Preparacion administrativa de identidades; las comprobaciones usan roles API.
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'saved-trips-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'saved-trips-b@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is(auth.uid(), '11111111-1111-4111-8111-111111111111'::uuid, 'Sesion del usuario A');
select lives_ok($$
  insert into public.saved_trips
    (id, origin, destination, departure_date, return_date, travelers, service_type)
  values
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Madrid', 'Paris', '2030-06-01', '2030-06-08', 2, 'ambos')
$$, 'A puede crear su viaje omitiendo user_id');
select is(
  (select user_id from public.saved_trips where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  auth.uid(), 'user_id toma la identidad autenticada'
);
select throws_ok($$
  insert into public.saved_trips (user_id, destination, departure_date, travelers, service_type)
  values ('22222222-2222-4222-8222-222222222222', 'Roma', '2030-06-01', 1, 'hotel')
$$, '42501', null, 'A no puede crear un viaje para B');

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select is(auth.uid(), '22222222-2222-4222-8222-222222222222'::uuid, 'Sesion del usuario B');
select lives_ok($$
  insert into public.saved_trips
    (id, destination, departure_date, travelers, service_type)
  values
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Tokio', '2030-07-01', 1, 'hotel')
$$, 'B puede crear su propio viaje');
select is(
  (select count(*) from public.saved_trips where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  1::bigint, 'B ve su viaje'
);
select is(
  (select count(*) from public.saved_trips where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  0::bigint, 'B no ve el viaje de A aunque conozca su id'
);
select throws_ok($$
  insert into public.saved_trips (user_id, destination, departure_date, travelers, service_type)
  values ('11111111-1111-4111-8111-111111111111', 'Roma', '2030-06-01', 1, 'hotel')
$$, '42501', null, 'B no puede crear un viaje para A');
with removed as (
  delete from public.saved_trips where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' returning id
)
select is(
  (select count(*) from removed),
  0::bigint, 'B no puede eliminar el viaje de A'
);
select throws_ok($$
  update public.saved_trips set destination = 'Roma'
  where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
$$, '42501', null, 'No se permite actualizar viajes, ni siquiera propios');

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is(
  (select count(*) from public.saved_trips where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  1::bigint, 'A sigue viendo su viaje tras el intento de B'
);
select is(
  (select count(*) from public.saved_trips where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  0::bigint, 'A no ve el viaje de B'
);
with removed as (
  delete from public.saved_trips where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' returning id
)
select is(
  (select count(*) from removed),
  0::bigint, 'A no puede eliminar el viaje de B'
);
with removed as (
  delete from public.saved_trips where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' returning id
)
select is(
  (select count(*) from removed),
  1::bigint, 'A puede eliminar su propio viaje'
);

set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select is(
  (select count(*) from public.saved_trips where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  1::bigint, 'El viaje de B no fue eliminado por A'
);
with removed as (
  delete from public.saved_trips where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' returning id
)
select is(
  (select count(*) from removed),
  1::bigint, 'B puede eliminar su propio viaje'
);

-- Sin sesion: ademas de RLS, los permisos de tabla deniegan todo acceso.
reset role;
-- Mantener filas reales en la prueba: un SELECT vacio no debe pasar
-- simplemente porque los viajes anteriores ya se hayan eliminado.
insert into public.saved_trips
  (id, user_id, destination, departure_date, travelers, service_type)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Paris', '2030-06-01', 2, 'vuelo'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Tokio', '2030-07-01', 1, 'hotel');

set local role anon;
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{}';

select is(auth.uid(), null::uuid, 'Sin sesion no hay identidad');
select throws_ok($$select * from public.saved_trips$$,
  '42501', null, 'anon no puede consultar viajes');
select throws_ok($$
  insert into public.saved_trips (user_id, destination, departure_date, travelers, service_type)
  values ('11111111-1111-4111-8111-111111111111', 'Roma', '2030-06-01', 1, 'hotel')
$$, '42501', null, 'anon no puede crear viajes');
select throws_ok($$delete from public.saved_trips$$,
  '42501', null, 'anon no puede eliminar viajes');
select throws_ok($$update public.saved_trips set destination = 'Roma'$$,
  '42501', null, 'anon no puede actualizar viajes');

-- Incluso con rol authenticated, sin sub no se obtiene acceso a filas.
reset role;
set local role authenticated;
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{}';

select is((select count(*) from public.saved_trips), 0::bigint,
  'authenticated sin identidad no ve viajes');
select throws_ok($$
  insert into public.saved_trips (user_id, destination, departure_date, travelers, service_type)
  values ('11111111-1111-4111-8111-111111111111', 'Roma', '2030-06-01', 1, 'hotel')
$$, '42501', null, 'authenticated sin identidad no puede crear viajes');
with removed as (delete from public.saved_trips returning id)
select is(
  (select count(*) from removed),
  0::bigint, 'authenticated sin identidad no puede eliminar viajes'
);

reset role;
select is(
  (select count(*) from public.saved_trips
    where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')),
  2::bigint, 'Los intentos sin sesion no eliminaron los viajes de A y B'
);
select * from finish();
rollback;
