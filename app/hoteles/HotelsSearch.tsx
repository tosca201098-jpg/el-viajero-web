'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import LanguageSelector from '@/app/components/LanguageSelector';
import { useLanguage } from '@/app/components/LanguageProvider';
import { hotelDefaults, hotelsHref, localCalendarDate, stay22MapSrc, validHotelSearch, type HotelForm } from '@/lib/stay22/hotels';

export default function HotelsSearch({ initial }: { initial: HotelForm }) {
  const { language, t } = useLanguage();
  const [form, setForm] = useState(initial);
  // Form edits do not silently change the results. Submit to update the URL and map together.
  const [submitted, setSubmitted] = useState<HotelForm | null>(() => validHotelSearch(initial) ? initial : null);
  const [error, setError] = useState(!!(initial.checkin || initial.checkout) && !validHotelSearch(initial));
  const src = submitted ? stay22MapSrc(submitted, language) : null;
  const dirty = submitted && (Object.keys(hotelDefaults) as (keyof HotelForm)[]).some(key => form[key] !== submitted[key]);
  function update(key: keyof HotelForm, value: string) { setForm(current => ({ ...current, [key]: value })); }
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validHotelSearch(form)) { setError(true); return; }
    setError(false);
    const next = { ...form, destination: form.destination.trim() };
    setForm(next);
    setSubmitted(next);
    window.history.replaceState(null, '', hotelsHref(next));
  }
  const inputClass = 'mt-1 min-h-11 w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-2 text-base font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20';
  return <main className="min-h-screen bg-[#F7F2E8] text-stone-800">
    <nav className="border-b border-blue-600/20 bg-[#60A5FA] px-4" aria-label={t('brand.name')}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 py-3">
        <Link href="/" className="inline-flex min-h-11 items-center font-bold">← {t('brand.name')}</Link>
        <LanguageSelector />
      </div>
    </nav>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-3xl font-black sm:text-4xl">{t('search.findHotels')}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{t('hotels.intro')}</p>
      <form onSubmit={search} className="mt-5 rounded-2xl border border-blue-200 bg-white/80 p-4 sm:p-5">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="min-w-0 text-sm font-semibold sm:col-span-2">{t('search.destination')}
            <input required maxLength={200} name="destination" value={form.destination} onChange={e => update('destination', e.target.value)} placeholder="Barcelona, España" className={inputClass} />
          </label>
          <label className="min-w-0 text-sm font-semibold">{t('search.checkIn')}
            <input required name="checkin" type="date" min={localCalendarDate()} value={form.checkin} onChange={e => update('checkin', e.target.value)} className={inputClass} />
          </label>
          <label className="min-w-0 text-sm font-semibold">{t('search.checkOut')}
            <input required name="checkout" type="date" min={form.checkin || localCalendarDate()} value={form.checkout} onChange={e => update('checkout', e.target.value)} className={inputClass} />
          </label>
          {(['adults', 'children', 'infants', 'rooms'] as const).map(key => <label key={key} className="min-w-0 text-sm font-semibold">
            {t(key === 'rooms' ? 'search.rooms' : `hotels.${key}`)}
            <input required name={key} type="number" min={key === 'children' || key === 'infants' ? 0 : 1} max={key === 'rooms' ? 5 : 10} step={1} value={form[key]} onChange={e => update(key, e.target.value)} className={inputClass} />
          </label>)}
          <label className="min-w-0 text-sm font-semibold">{t('hotels.currency')}
            <select name="currency" value={form.currency} onChange={e => update('currency', e.target.value)} className={inputClass}>
              {['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'JPY'].map(currency => <option key={currency}>{currency}</option>)}
            </select>
          </label>
          <button type="submit" className="min-h-11 self-end rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 sm:col-span-2 lg:col-span-3">{t('search.findHotels')}</button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-800">{t('hotels.invalid')}</p>}
      </form>
      {dirty && <p role="status" className="mt-4 rounded-xl border border-blue-200 bg-white p-3 text-sm">{t('hotels.changed')}</p>}
      {language === 'ca' && <p className="mt-4 text-sm">El mapa de Stay22 es mostra en castellà; el català no hi està disponible.</p>}
      {src && submitted ? <section className="mt-6" aria-label={t('hotels.map')}>
        <h2 className="text-xl font-bold">{submitted.destination}</h2>
        <p className="mt-1 text-sm text-stone-600">{submitted.checkin} → {submitted.checkout} · {t('hotels.adults')}: {submitted.adults} · {t('hotels.children')}: {submitted.children} · {t('hotels.infants')}: {submitted.infants} · {t('search.rooms')}: {submitted.rooms} · {submitted.currency}</p>
        <p className="mt-3 text-sm leading-6 text-stone-600">{t('hotels.prices')}</p>
        <iframe key={src} id="stay22-widget" title={t('hotels.map')} src={src} loading="lazy" allowFullScreen className="mt-3 h-[650px] w-full rounded-2xl border-0 bg-white sm:h-[700px]" />
      </section> : <p role="status" className="mt-6 rounded-2xl border border-blue-200 bg-white p-5 text-sm">{t('hotels.enterDates')}</p>}
      <p className="mt-4 text-xs leading-5 text-stone-600">{t('hotels.affiliate')}</p>
    </div>
  </main>;
}
