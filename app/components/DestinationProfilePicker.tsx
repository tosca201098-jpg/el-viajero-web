"use client";

import { useState } from 'react';
import { destinationProfiles, getDestinationById, type DestinationProfile } from '@/lib/destinations';
import { getDestinationText, getDestinationCountryName } from '@/lib/destinations/localization';
import { useLanguage } from './LanguageProvider';

export default function DestinationProfilePicker({ onSelect }: { onSelect: (destination: DestinationProfile) => void }) {
  const { language, t } = useLanguage();
  const [destinationId, setDestinationId] = useState('');
  return (
    <div className="mx-auto mb-6 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-end">
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-left text-sm font-semibold text-stone-800">
        {t('destinations.choose')}
        <select value={destinationId} onChange={event => setDestinationId(event.target.value)} className="min-h-[44px] w-full min-w-0 rounded-xl border border-blue-600/30 bg-white px-3 text-sm text-stone-900">
          <option value="">{t('destinations.choose')}</option>
          {destinationProfiles.map(destination => (
            <option key={destination.id} value={destination.id}>
              {getDestinationText(destination, language).name}, {getDestinationCountryName(destination, language)}
            </option>
          ))}
        </select>
      </label>
      <button type="button" disabled={!destinationId} onClick={() => {
        const destination = getDestinationById(destinationId);
        if (destination) onSelect(destination);
      }} className="min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
        {t('monthly.viewDestination')}
      </button>
    </div>
  );
}
