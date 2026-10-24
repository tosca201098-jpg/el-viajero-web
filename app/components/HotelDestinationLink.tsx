'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { hotelDefaults, hotelFlightDefaults, hotelsHref } from '@/lib/stay22/hotels';
import type { ItineraryContext } from './ItineraryPlanner';

export default function HotelDestinationLink({ destination, context }: {
  destination: { name: string; country: string }; context: ItineraryContext;
}) {
  const { t } = useLanguage();
  return <Link href={hotelsHref({ ...hotelDefaults, ...hotelFlightDefaults(context), destination: `${destination.name}, ${destination.country}` })}
    className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
    🏨 {t('search.findHotels')}
  </Link>;
}
