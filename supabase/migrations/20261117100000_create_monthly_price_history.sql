-- Historial de precios reales de «Viajes por mes».
-- Una fila por aeropuerto de salida, destino, año y mes del viaje y día en que se vio el precio: el precio más barato
-- de una escapada (2–5 noches) que devolvió el proveedor ese día. Sirve para poder decir, algún día y solo con datos
-- reales, «más barato de lo habitual». La tarea diaria lo guarda una vez por semana (ver lib/travelpayouts/monthly-history.ts).
-- La tabla es PRIVADA: solo la clave secreta del servidor (service_role) puede leerla y escribirla.
begin;

create table public.monthly_price_history (
  origin text not null,
  destination_id text not null,
  year smallint not null,
  month smallint not null,
  seen_on date not null,
  price numeric(8, 2) not null,
  nights smallint not null,
  transfers smallint,

  primary key (origin, destination_id, year, month, seen_on),

  constraint monthly_price_history_origin_valid
    check (origin ~ '^[A-Z]{3}$'),

  constraint monthly_price_history_destination_valid
    check (length(trim(destination_id)) > 0),

  constraint monthly_price_history_period_valid
    check (month between 1 and 12 and year between 2026 and 2100),

  constraint monthly_price_history_price_valid
    check (price > 0 and price < 100000),

  constraint monthly_price_history_nights_valid
    check (nights between 2 and 5),

  constraint monthly_price_history_transfers_valid
    check (transfers is null or transfers >= 0)
);

-- Limpieza de lo antiguo (la lectura por ruta y mes usa la clave primaria).
create index monthly_price_history_seen_idx
  on public.monthly_price_history (seen_on);

alter table public.monthly_price_history enable row level security;

-- Sin permisos públicos y SIN políticas: la web (anon) y los usuarios con sesión no ven esta tabla.
revoke all privileges on table public.monthly_price_history
  from public, anon, authenticated;

grant select, insert, update, delete on table public.monthly_price_history
  to service_role;

commit;
