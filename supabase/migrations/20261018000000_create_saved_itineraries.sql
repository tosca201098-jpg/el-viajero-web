begin;

create table public.saved_itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  destination_name text not null,
  country text not null,
  locale text not null,
  days_count integer not null,
  itinerary jsonb not null,
  created_at timestamptz not null default now(),

  constraint saved_itineraries_destination_valid
    check (length(trim(destination_name)) between 1 and 160),
  constraint saved_itineraries_country_valid
    check (length(trim(country)) between 1 and 100),
  constraint saved_itineraries_locale_valid
    check (locale in ('es', 'en', 'fr', 'de', 'it', 'pt', 'ca')),
  constraint saved_itineraries_days_valid
    check (days_count between 1 and 7),
  constraint saved_itineraries_payload_valid
    check (
      jsonb_typeof(itinerary) = 'object'
      and jsonb_typeof(itinerary -> 'days') = 'array'
      and jsonb_array_length(itinerary -> 'days') = days_count
      and octet_length(itinerary::text) <= 30000
    )
);

create index saved_itineraries_user_created_idx
  on public.saved_itineraries (user_id, created_at desc);

alter table public.saved_itineraries enable row level security;

revoke all privileges on table public.saved_itineraries
  from public, anon, authenticated;
grant select, insert, delete on table public.saved_itineraries
  to authenticated;

create policy saved_itineraries_select_own
  on public.saved_itineraries
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy saved_itineraries_insert_own
  on public.saved_itineraries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy saved_itineraries_delete_own
  on public.saved_itineraries
  for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;
