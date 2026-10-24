'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import LanguageSelector from '@/app/components/LanguageSelector';
import { useLanguage } from '@/app/components/LanguageProvider';
import { hotelDefaults, hotelsHref, localCalendarDate, stay22MapSrc, validHotelSearch, type HotelForm } from '@/lib/stay22/hotels';

export default function HotelsSearch({ initial }: { initial: HotelForm }) {
  const { language, t } = useLanguage();
  const [form, setForm] = useState(initial);
  // Edits update the visible map only after an explicit search.
  const [submitted, setSubmitted] = useState<HotelForm | null>(() => validHotelSearch(initial) ? initial : null);
  const [editingMobile, setEditingMobile] = useState(false);
  const [error, setError] = useState(!!(initial.checkin || initial.checkout) && !validHotelSearch(initial));
  const src = submitted ? stay22MapSrc(submitted, language) : null;
  const dirty = submitted && (Object.keys(hotelDefaults) as (keyof HotelForm)[]).some(key => form[key] !== submitted[key]);

  function update(key: keyof HotelForm, value: string) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validHotelSearch(form)) { setError(true); return; }
    setError(false);
    const next = { ...form, destination: form.destination.trim() };
    setForm(next);
    setSubmitted(next);
    setEditingMobile(false);
    window.history.replaceState(null, '', hotelsHref(next));
  }

  const inputClass = 'mt-1 min-h-11 w-full min-w-0 rounded-xl border border-stone-300 bg-white px-3 py-2 text-base font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20';

  function extraNumber(key: 'children' | 'infants' | 'rooms', mobile: boolean) {
    return <label key={key + (mobile ? '-mobile' : '-desktop')} className="min-w-0 text-sm font-semibold">
      {t(key === 'rooms' ? 'search.rooms' : key === 'children' ? 'hotels.children' : 'hotels.infants')}
      <input name={mobile ? key + '-mobile' : key} type="number" min={key === 'rooms' ? 1 : 0} max={key === 'rooms' ? 5 : 10} step={1} value={form[key]} onChange={e => update(key, e.target.value)} className={inputClass} />
    </label>;
  }

  function currency(mobile: boolean) {
    return <label key={mobile ? 'currency-mobile' : 'currency-desktop'} className="min-w-0 text-sm font-semibold">
      {t('hotels.currency')}
      <select name={mobile ? 'currency-mobile' : 'currency'} value={form.currency} onChange={e => update('currency', e.target.value)} className={inputClass}>
        {['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'JPY'].map(value => <option key={value}>{value}</option>)}
      </select>
    </label>;
  }

  return <main className="min-h-screen bg-[#F7F2E8] text-stone-800">
    <nav className="border-b border-blue-600/20 bg-[#60A5FA] px-4" aria-label={t('brand.name')}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 py-3">
        <Link href="/" className="inline-flex min-h-11 items-center font-bold">← {t('brand.name')}</Link>
        <LanguageSelector />
      </div>
    </nav>
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-8">
      <h1 className={submitted ? 'sr-only sm:not-sr-only sm:text-4xl sm:font-black' : 'text-2xl font-black sm:text-4xl'}>{t('search.findHotels')}</h1>
      <p className={submitted ? 'hidden sm:mt-2 sm:block sm:max-w-3xl sm:text-sm sm:leading-6 sm:text-stone-600' : 'mt-2 max-w-3xl text-sm leading-6 text-stone-600'}>{t('hotels.intro')}</p>

      {submitted && <section className="rounded-2xl border border-blue-200 bg-white/90 p-3 sm:hidden" aria-label={t('search.findHotels')}>
        <h2 className="truncate text-lg font-bold" title={submitted.destination}>{submitted.destination}</h2>
        <p className="mt-1 text-sm leading-5 text-stone-700">{submitted.checkin} → {submitted.checkout}</p>
        <p className="text-sm leading-5 text-stone-700">{t('hotels.adults')}: {submitted.adults} · {t('search.rooms')}: {submitted.rooms}</p>
        <button type="button" aria-controls="hotels-search-form" aria-expanded={editingMobile} onClick={() => setEditingMobile(value => !value)} className="mt-2 min-h-11 w-full rounded-xl border border-blue-600 px-3 py-2 text-sm font-bold text-blue-700">
          {t('hotels.modifySearch')}
        </button>
      </section>}

      <form id="hotels-search-form" onSubmit={search} noValidate className={'mt-3 rounded-2xl border border-blue-200 bg-white/80 p-3 sm:mt-5 sm:p-5' + (submitted && !editingMobile ? ' hidden sm:block' : '')}>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <label className="col-span-2 min-w-0 text-sm font-semibold">{t('search.destination')}
            <input maxLength={200} name="destination" value={form.destination} onChange={e => update('destination', e.target.value)} placeholder="Barcelona, España" className={inputClass} />
          </label>
          <label className="min-w-0 text-sm font-semibold">{t('search.checkIn')}
            <input name="checkin" type="date" min={localCalendarDate()} value={form.checkin} onChange={e => update('checkin', e.target.value)} className={inputClass} />
          </label>
          <label className="min-w-0 text-sm font-semibold">{t('search.checkOut')}
            <input name="checkout" type="date" min={form.checkin || localCalendarDate()} value={form.checkout} onChange={e => update('checkout', e.target.value)} className={inputClass} />
          </label>
          <label className="col-span-2 min-w-0 text-sm font-semibold sm:col-span-1">{t('hotels.adults')}
            <input name="adults" type="number" min={1} max={10} step={1} value={form.adults} onChange={e => update('adults', e.target.value)} className={inputClass} />
          </label>
          <details className="col-span-2 rounded-xl border border-blue-100 p-2 sm:hidden">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-blue-700">{t('hotels.moreOptions')}</summary>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {extraNumber('children', true)}{extraNumber('infants', true)}{extraNumber('rooms', true)}{currency(true)}
            </div>
          </details>
          <div className="hidden sm:contents">
            {extraNumber('children', false)}{extraNumber('infants', false)}{extraNumber('rooms', false)}{currency(false)}
          </div>
          <button type="submit" className="col-span-2 min-h-11 self-end rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 sm:col-span-2 lg:col-span-3">{t('search.findHotels')}</button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-800">{t('hotels.invalid')}</p>}
      </form>

      {dirty && <p role="status" className="mt-3 rounded-xl border border-blue-200 bg-white p-3 text-sm">{t('hotels.changed')}</p>}
      {src && submitted ? <section className="mt-2 sm:mt-6" aria-label={t('hotels.map')}>
        <h2 className="hidden text-xl font-bold sm:block">{submitted.destination}</h2>
        <p className="mt-1 hidden text-sm text-stone-600 sm:block">{submitted.checkin} → {submitted.checkout} · {t('hotels.adults')}: {submitted.adults} · {t('hotels.children')}: {submitted.children} · {t('hotels.infants')}: {submitted.infants} · {t('search.rooms')}: {submitted.rooms} · {submitted.currency}</p>
        <p className="mt-3 hidden text-sm leading-6 text-stone-600 sm:block">{t('hotels.prices')}</p>
        <iframe key={src} id="stay22-widget" title={t('hotels.map')} src={src} loading="eager" allowFullScreen className="h-[70dvh] min-h-[420px] w-full rounded-2xl border-0 bg-white sm:mt-3 sm:h-[700px]" />
        <p className="mt-2 text-xs leading-5 text-stone-600 sm:hidden">{t('hotels.mobilePrices')}</p>
      </section> : <p role="status" className="mt-6 rounded-2xl border border-blue-200 bg-white p-5 text-sm">{t('hotels.enterDates')}</p>}
      {language === 'ca' && <p className="mt-2 text-sm">El mapa de Stay22 es mostra en castellà; el català no hi està disponible.</p>}
      <p className="mt-4 text-xs leading-5 text-stone-600">{t('hotels.affiliate')}</p>
    </div>
  </main>;
}
