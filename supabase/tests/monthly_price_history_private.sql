-- SOLO para una base local/de pruebas con la migracion ya aplicada.
-- Ejecutar con el runner pgTAP de Supabase: supabase test db.
-- No ejecutar en el proyecto alojado de Supabase sin autorizacion.
-- Las filas siguientes son fixtures temporales: ROLLBACK las elimina.
begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;
grant usage on schema extensions to anon, authenticated, service_role;

select plan(46);

-- Forma de la tabla
select has_table('public', 'monthly_price_history', 'Existe monthly_price_history');
select is(
  (select array_agg(column_name::text order by ordinal_position)
     from information_schema.columns
    where table_schema = 'public' and table_name = 'monthly_price_history'),
  array['origin', 'destination_id', 'year', 'month', 'seen_on', 'price', 'nights', 'transfers'],
  'Columnas esperadas'
);
select is(
  (select array_agg(a.attname::text order by k.ord)
     from pg_index i
     cross join lateral unnest(i.indkey) with ordinality as k(attnum, ord)
     join pg_attribute a on a.attrelid = i.indrelid and a.attnum = k.attnum
    where i.indrelid = 'public.monthly_price_history'::regclass and i.indisprimary),
  array['origin', 'destination_id', 'year', 'month', 'seen_on'],
  'La clave primaria es aeropuerto, destino, año, mes y dia'
);
select ok(
  exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'monthly_price_history_seen_idx'),
  'Existe el indice para limpiar por dia'
);

-- Privada: RLS activado, sin politicas y sin permisos para la web ni para usuarios con sesion
select ok(
  (select relrowsecurity from pg_class where oid = 'public.monthly_price_history'::regclass),
  'RLS esta activado'
);
select is(
  (select count(*)::int from pg_policies where schemaname = 'public' and tablename = 'monthly_price_history'),
  0, 'No hay politicas'
);
select ok(not has_table_privilege('anon', 'public.monthly_price_history', 'select'), 'anon no puede leer');
select ok(not has_table_privilege('anon', 'public.monthly_price_history', 'insert'), 'anon no puede insertar');
select ok(not has_table_privilege('anon', 'public.monthly_price_history', 'update'), 'anon no puede actualizar');
select ok(not has_table_privilege('anon', 'public.monthly_price_history', 'delete'), 'anon no puede borrar');
select ok(not has_table_privilege('authenticated', 'public.monthly_price_history', 'select'), 'authenticated no puede leer');
select ok(not has_table_privilege('authenticated', 'public.monthly_price_history', 'insert'), 'authenticated no puede insertar');
select ok(not has_table_privilege('authenticated', 'public.monthly_price_history', 'update'), 'authenticated no puede actualizar');
select ok(not has_table_privilege('authenticated', 'public.monthly_price_history', 'delete'), 'authenticated no puede borrar');
select ok(has_table_privilege('service_role', 'public.monthly_price_history', 'select'), 'service_role puede leer');
select ok(has_table_privilege('service_role', 'public.monthly_price_history', 'insert'), 'service_role puede insertar');
select ok(has_table_privilege('service_role', 'public.monthly_price_history', 'update'), 'service_role puede actualizar');
select ok(has_table_privilege('service_role', 'public.monthly_price_history', 'delete'), 'service_role puede borrar');

-- Preparacion administrativa (como la tarea diaria, con la clave secreta del servidor)
set local role service_role;

select lives_ok($$
  insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights, transfers)
  values ('MAD', 'pt-lisboa', 2027, 1, '2026-11-16', 46.50, 2, 0)
$$, 'El servidor puede guardar un precio');
select lives_ok($$
  insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights, transfers)
  values ('MAD', 'pt-lisboa', 2027, 1, '2026-11-23', 39.00, 3, null)
$$, 'Otra semana: otra fila para la misma ruta y mes (asi se forma el historial); escalas pueden ser null');
select is(
  (select count(*)::int from public.monthly_price_history where origin = 'MAD' and destination_id = 'pt-lisboa'),
  2, 'Dos semanas, dos filas'
);
select throws_ok($$
  insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 1, '2026-11-16', 50, 2)
$$, '23505', null, 'Mismo dia, misma ruta y mes: no se duplica');
select lives_ok($$
  insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 1, '2026-11-16', 44, 2)
  on conflict (origin, destination_id, year, month, seen_on) do update set price = excluded.price
$$, 'El upsert del mismo dia lo sustituye');
select is(
  (select price from public.monthly_price_history where seen_on = '2026-11-16' and destination_id = 'pt-lisboa'),
  44.00, 'El precio del dia se ha actualizado'
);
select is(
  (select count(*)::int from public.monthly_price_history), 2, 'Sigue habiendo dos filas'
);

-- Valores no validos: los rechaza la propia base de datos
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('mad', 'pt-lisboa', 2027, 2, '2026-11-16', 40, 2) $$, '23514', null, 'Aeropuerto en minusculas');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MADR', 'pt-lisboa', 2027, 2, '2026-11-16', 40, 2) $$, '23514', null, 'Aeropuerto de 4 letras');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', '   ', 2027, 2, '2026-11-16', 40, 2) $$, '23514', null, 'Destino vacio');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2025, 2, '2026-11-16', 40, 2) $$, '23514', null, 'Año demasiado antiguo');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 13, '2026-11-16', 40, 2) $$, '23514', null, 'Mes 13');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 0, '2026-11-16', 40, 2) $$, '23514', null, 'Mes 0');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 2, '2026-11-16', 0, 2) $$, '23514', null, 'Precio cero');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 2, '2026-11-16', -5, 2) $$, '23514', null, 'Precio negativo');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 2, '2026-11-16', 100000, 2) $$, '23514', null, 'Precio de 100.000 o mas');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 2, '2026-11-16', 1000000, 2) $$, '22003', null, 'Precio fuera del rango del tipo numeric(8,2)');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 2, '2026-11-16', 40, 1) $$, '23514', null, 'Una noche no es una escapada');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 2, '2026-11-16', 40, 6) $$, '23514', null, 'Seis noches no es una escapada');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights, transfers)
  values ('MAD', 'pt-lisboa', 2027, 2, '2026-11-16', 40, 2, -1) $$, '23514', null, 'Escalas negativas');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values (null, 'pt-lisboa', 2027, 2, '2026-11-16', 40, 2) $$, '23502', null, 'El aeropuerto es obligatorio');

-- Limpieza: borra lo anterior a una fecha
select lives_ok($$ delete from public.monthly_price_history where seen_on < '2026-11-20' $$, 'El servidor puede limpiar por fecha');
select is((select count(*)::int from public.monthly_price_history), 1, 'Solo queda la fila mas reciente');

-- La web y los usuarios con sesion no pueden ver ni tocar nada
set local role anon;
select throws_ok($$ select * from public.monthly_price_history $$, '42501', null, 'anon no lee');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 3, '2026-11-16', 40, 2) $$, '42501', null, 'anon no escribe');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';
select throws_ok($$ select * from public.monthly_price_history $$, '42501', null, 'Un usuario con sesion no lee');
select throws_ok($$ insert into public.monthly_price_history (origin, destination_id, year, month, seen_on, price, nights)
  values ('MAD', 'pt-lisboa', 2027, 3, '2026-11-16', 40, 2) $$, '42501', null, 'Un usuario con sesion no escribe');
select throws_ok($$ delete from public.monthly_price_history $$, '42501', null, 'Un usuario con sesion no borra');

reset role;
select * from finish();
rollback;
