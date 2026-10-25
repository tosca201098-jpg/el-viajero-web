import type { Metadata } from 'next';
import HotelsSearch from './HotelsSearch';
import { hotelDefaults, type HotelForm } from '@/lib/stay22/hotels';
import { findDestinationProfile } from '@/lib/destinations';

export const metadata: Metadata = {
  title: 'Buscar hoteles | Destinauta',
  description: 'Busca alojamiento en el mapa de Stay22 con tus fechas y huéspedes.',
  robots: { index: false, follow: false },
};

export default async function HotelesPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = { ...hotelDefaults };
  for (const key of Object.keys(initial) as (keyof HotelForm)[]) {
    if (typeof params[key] === 'string') initial[key] = params[key] as string;
    else if (Array.isArray(params[key])) initial[key] = ''; // Ambiguous query values must not become a priced search.
  }
  // Resolve catalog names to city + country, never to an airport serving the city.
  const profile = findDestinationProfile({ name: initial.destination });
  if (profile) initial.destination = `${profile.name}, ${profile.country}`;
  return <HotelsSearch initial={initial} />;
}
