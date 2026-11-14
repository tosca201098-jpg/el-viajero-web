-- Precios reales de «Viajes por mes» guardados cada día por la tarea automática (Vercel Cron).
-- Una fila por aeropuerto de salida, destino, año y mes: el último precio visto de una escapada (2–5 noches).
-- La tabla es PRIVADA: solo la clave secreta del servidor (service_role) puede leerla y escribirla.
begin;

create table public.monthly_prices (
  origin text not null,
  destination_id text not null,
  year smallint not null,
  month smallint not null,
  price numeric(8, 2) not null,
  departure_at date not null,
  return_at date not null,
  nights smallint not null,
  transfers smallint,
  offer_url text,
  seen_at timestamptz not null default now(),

  primary key (origin, destination_id, year, month),

  constraint monthly_prices_origin_valid
    check (origin ~ '^[A-Z]{3}$'),

  constraint monthly_prices_destination_valid
    check (length(trim(destination_id)) > 0),

  constraint monthly_prices_period_valid
    check (month between 1 and 12 and year between 2026 and 2100),

  constraint monthly_prices_price_valid
    check (price > 0 and price < 100000),

  constraint monthly_prices_escapada_valid
    check (nights between 2 and 5 and return_at = departure_at + nights),

  constraint monthly_prices_transfers_valid
    check (transfers is null or transfers >= 0),

  constraint monthly_prices_offer_url_valid
    check (
      offer_url is null
      or offer_url ~ '^https://(www\.)?aviasales\.com/'
    )
);

-- Lectura de la API: un aeropuerto, un mes y los precios vistos recientemente.
create index monthly_prices_lookup_idx
  on public.monthly_prices (origin, year, month, seen_at desc);

-- Limpieza diaria de precios antiguos.
create index monthly_prices_seen_idx
  on public.monthly_prices (seen_at);

alter table public.monthly_prices enable row level security;

-- Sin permisos públicos y SIN políticas: la web (anon) y los usuarios con sesión no ven esta tabla.
revoke all privileges on table public.monthly_prices
  from public, anon, authenticated;

grant select, insert, update, delete on table public.monthly_prices
  to service_role;

commit;
