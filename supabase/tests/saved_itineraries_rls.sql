-- Ejecutar solo contra una base local/de pruebas con la migracion aplicada:
-- supabase test db. No ejecutar estas fixtures en produccion.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;
grant usage on schema extensions to anon, authenticated;

select plan(19);
select has_table('public', 'saved_itineraries', 'Existe saved_itineraries');
select ok((select relrowsecurity from pg_class where oid = 'public.saved_itineraries'::regclass), 'RLS activado');

insert into auth.users (id, email) values
  ('33333333-3333-4333-8333-333333333333', 'saved-itinerary-a@example.test'),
  ('44444444-4444-4444-8444-444444444444', 'saved-itinerary-b@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
set local request.jwt.claims = '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';
select is(auth.uid(), '33333333-3333-4333-8333-333333333333'::uuid, 'Identidad A');
select lives_ok($$
  insert into public.saved_itineraries (id, destination_name, country, locale, days_count, itinerary)
  values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Madrid', 'España', 'es', 2,
    '{"title":"Madrid","summary":"Dos días","days":[{},{}],"tips":[]}'::jsonb)
$$, 'A crea su itinerario');
select is((select user_id from public.saved_itineraries where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), auth.uid(), 'Propietario por defecto es A');
select throws_ok($$
  insert into public.saved_itineraries (user_id, destination_name, country, locale, days_count, itinerary)
  values ('44444444-4444-4444-8444-444444444444', 'Lisboa', 'Portugal', 'es', 1,
    '{"days":[{}]}'::jsonb)
$$, '42501', null, 'A no crea para B');

set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
set local request.jwt.claims = '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}';
select lives_ok($$
  insert into public.saved_itineraries (id, destination_name, country, locale, days_count, itinerary)
  values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Lisboa', 'Portugal', 'pt', 1,
    '{"days":[{}]}'::jsonb)
$$, 'B crea su itinerario');
select is((select count(*) from public.saved_itineraries), 1::bigint, 'B solo ve su itinerario');
select is((select count(*) from public.saved_itineraries where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), 0::bigint, 'B no ve el itinerario de A');
with removed as (delete from public.saved_itineraries where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' returning id)
select is((select count(*) from removed), 0::bigint, 'B no elimina el itinerario de A');
select throws_ok($$update public.saved_itineraries set country = 'Otro'$$, '42501', null, 'B no puede actualizar itinerarios');

set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
set local request.jwt.claims = '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';
select is((select count(*) from public.saved_itineraries), 1::bigint, 'A solo ve su itinerario');
with removed as (delete from public.saved_itineraries where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' returning id)
select is((select count(*) from removed), 0::bigint, 'A no elimina el itinerario de B');
with removed as (delete from public.saved_itineraries where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' returning id)
select is((select count(*) from removed), 1::bigint, 'A elimina su propio itinerario');

reset role;
insert into public.saved_itineraries (id, user_id, destination_name, country, locale, days_count, itinerary)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333',
  'Madrid', 'España', 'es', 1, '{"days":[{}]}'::jsonb);
set local role anon;
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{}';
select throws_ok($$select * from public.saved_itineraries$$, '42501', null, 'anon no puede leer');
select throws_ok($$insert into public.saved_itineraries (destination_name, country, locale, days_count, itinerary) values ('Roma','Italia','es',1,'{"days":[{}]}'::jsonb)$$,
  '42501', null, 'anon no puede insertar');
select throws_ok($$delete from public.saved_itineraries$$, '42501', null, 'anon no puede eliminar');
reset role;
set local role authenticated;
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{}';
select is((select count(*) from public.saved_itineraries), 0::bigint, 'Sin identidad no se ven filas');
with removed as (delete from public.saved_itineraries returning id)
select is((select count(*) from removed), 0::bigint, 'Sin identidad no se eliminan filas');

select * from finish();
rollback;
