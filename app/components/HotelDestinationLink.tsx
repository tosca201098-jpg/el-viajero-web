'use client';

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { hotelDefaults, hotelFlightDefaults, hotelsHref } from '@/lib/stay22/hotels';
import type { ItineraryContext } from './ItineraryPlanner';
import { destinationWindowStyle as windowStyle } from './destination-window-style';

// "window" es el botón del diseño de la ficha (Roma); por defecto conserva el aspecto de siempre.
export default function HotelDestinationLink({ destination, context, variant = 'default' }: {
  destination: { name: string; country: string }; context: ItineraryContext; variant?: 'default' | 'window';
}) {
  const { t } = useLanguage();
  const link = <Link href={hotelsHref({ ...hotelDefaults, ...hotelFlightDefaults(context), destination: `${destination.name}, ${destination.country}` })}
    className={variant === 'window' ? windowStyle.secondaryActionLink
      : 'inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700'}>
    🏨 {t('search.findHotels')}
  </Link>;
  return variant === 'window' ? <div className={windowStyle.actions}>{link}</div> : link;
}
