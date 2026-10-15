begin;

create table public.saved_trips (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,

  origin text,
  destination text not null,
  departure_date date not null,
  return_date date,
  travelers integer not null,
  service_type text not null,
  created_at timestamptz not null default now(),

  constraint saved_trips_origin_valid
    check (origin is null or length(trim(origin)) > 0),

  constraint saved_trips_destination_valid
    check (length(trim(destination)) > 0),

  constraint saved_trips_travelers_valid
    check (travelers > 0),

  constraint saved_trips_service_valid
    check (service_type in ('vuelo', 'hotel', 'ambos')),

  constraint saved_trips_dates_valid
    check (
      return_date is null
      or return_date >= departure_date
    )
);

create index saved_trips_user_created_idx
  on public.saved_trips (user_id, created_at desc);

alter table public.saved_trips enable row level security;

-- Eliminar permisos que pudieran concederse por defecto.
revoke all privileges on table public.saved_trips
  from public, anon, authenticated;

grant select, insert, delete on table public.saved_trips
  to authenticated;

create policy saved_trips_select_own
  on public.saved_trips
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy saved_trips_insert_own
  on public.saved_trips
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy saved_trips_delete_own
  on public.saved_trips
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

commit;
