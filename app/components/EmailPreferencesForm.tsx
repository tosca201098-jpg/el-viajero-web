"use client";

// Pantalla del cuestionario de correo (sin estado propio: lo gestiona EmailPreferences.tsx). Todas las preguntas son opcionales.

import Link from "next/link";
import { MONTHLY_ORIGINS } from "@/lib/travelpayouts/monthly-shared";
import type { Locale } from "@/lib/i18n/translations";
import { emailText, type EmailTextKey } from "@/lib/email-preferences/texts";
import {
  EMAIL_SERVICE_LIVE, MAX_AIRPORTS, MAX_MONTHS, MAX_TRIP_TYPES, MONTH_NUMBERS,
  formatConsentDate, hasRequiredForEmails, monthName, normalizeAnswers, toggleLimited,
  type EmailPreferenceAnswers, type FlightBudget, type Frequency, type Reach, type TripLength, type TripType,
} from "@/lib/email-preferences/options";

export type FormNotice = "saved" | "saveError" | "deleted" | "deleteError";

const TRIP_TYPE_OPTIONS: ReadonlyArray<{ value: TripType; key: EmailTextKey }> = [
  { value: "beach", key: "type.beach" }, { value: "city", key: "type.city" }, { value: "mountain", key: "type.mountain" },
  { value: "gastronomy", key: "type.gastronomy" }, { value: "adventure", key: "type.adventure" }, { value: "relax", key: "type.relax" },
];
const LENGTH_OPTIONS: ReadonlyArray<{ value: TripLength; key: EmailTextKey }> = [
  { value: "weekend", key: "length.weekend" }, { value: "short", key: "length.short" }, { value: "week", key: "length.week" },
];
const REACH_OPTIONS: ReadonlyArray<{ value: Reach; key: EmailTextKey }> = [
  { value: "spain", key: "reach.spain" }, { value: "europe", key: "reach.europe" }, { value: "far", key: "reach.far" }, { value: "any", key: "any" },
];
const BUDGET_OPTIONS: ReadonlyArray<{ value: FlightBudget; key: EmailTextKey }> = [
  { value: "up100", key: "budget.up100" }, { value: "up200", key: "budget.up200" }, { value: "up400", key: "budget.up400" }, { value: "any", key: "any" },
];
const FREQUENCY_OPTIONS: ReadonlyArray<{ value: Frequency; key: EmailTextKey }> = [
  { value: "weekly", key: "frequency.weekly" }, { value: "fortnightly", key: "frequency.fortnightly" }, { value: "monthly", key: "frequency.monthly" },
];

const NOTICE_KEY: Record<FormNotice, EmailTextKey> = {
  saved: "saved", saveError: "saveError", deleted: "deleted", deleteError: "deleteError",
};

function CheckboxGroup<T extends string | number>({ legend, hint, options, selected, max, onToggle, columns }: {
  legend: string; hint: string; options: ReadonlyArray<{ value: T; label: string }>;
  selected: readonly T[]; max: number; onToggle: (value: T) => void; columns: string;
}) {
  const full = selected.length >= max;
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-semibold">{legend}</legend>
      <p className="mt-0.5 text-xs text-stone-600">{hint}</p>
      <div className={`mt-2 grid gap-2 ${columns}`}>
        {options.map((option) => {
          const checked = selected.includes(option.value);
          const disabled = full && !checked;
          return (
            <label key={String(option.value)} className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-3 py-2 text-sm ${checked ? "border-blue-600 bg-blue-50" : "border-stone-300 bg-white"} ${disabled ? "opacity-50" : "cursor-pointer"}`}>
              <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onToggle(option.value)} className="h-4 w-4 shrink-0 accent-blue-700" />
              <span className="min-w-0 break-words">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SelectField<T extends string>({ id, language, legendKey, value, options, onChange }: {
  id: string; language: Locale; legendKey: EmailTextKey; value: T | "";
  options: ReadonlyArray<{ value: T; key: EmailTextKey }>; onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-semibold">{emailText(language, legendKey)}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-[44px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus-visible:ring-2 focus-visible:ring-blue-600">
        <option value="">{emailText(language, "unanswered")}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{emailText(language, option.key)}</option>)}
      </select>
    </div>
  );
}

export default function EmailPreferencesForm({
  language, answers, onChange, onSave, onDelete, busy, notice, hasSavedRow, savedConsent, consentGivenAt, consentWithdrawnAt,
}: {
  language: Locale;
  answers: EmailPreferenceAnswers;
  onChange: (next: EmailPreferenceAnswers) => void;
  onSave: () => void;
  onDelete: () => void;
  busy: "" | "saving" | "deleting";
  notice: FormNotice | null;
  hasSavedRow: boolean;
  /** Estado del permiso ya guardado (no el de la casilla sin guardar). */
  savedConsent: boolean;
  consentGivenAt: string | null;
  consentWithdrawnAt: string | null;
}) {
  const complete = hasRequiredForEmails(answers);
  const set = (patch: Partial<EmailPreferenceAnswers>) => onChange(normalizeAnswers({ ...answers, ...patch }));
  const airportOptions = MONTHLY_ORIGINS.map((origin) => ({ value: origin.code, label: origin.label }));
  const monthOptions = MONTH_NUMBERS.map((month) => ({ value: month as number, label: monthName(language, month) }));
  const typeOptions = TRIP_TYPE_OPTIONS.map((option) => ({ value: option.value, label: emailText(language, option.key) }));
  const limit = (max: number) => emailText(language, "limit.hint", { max });
  const givenDate = savedConsent && consentGivenAt ? formatConsentDate(consentGivenAt, language) : "";
  const withdrawnDate = !savedConsent && consentWithdrawnAt ? formatConsentDate(consentWithdrawnAt, language) : "";
  const disabled = busy !== "";

  return (
    <form noValidate onSubmit={(event) => { event.preventDefault(); if (!disabled && !(answers.consent && !complete)) onSave(); }} className="space-y-5">
      <p className="text-sm leading-6 text-stone-700">{emailText(language, "intro")}</p>
      {!EMAIL_SERVICE_LIVE && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{emailText(language, "notLive")}</p>
      )}

      <CheckboxGroup legend={emailText(language, "airports.legend")} hint={limit(MAX_AIRPORTS)} options={airportOptions}
        selected={answers.airports} max={MAX_AIRPORTS} onToggle={(code) => set({ airports: toggleLimited(answers.airports, code, MAX_AIRPORTS) })} columns="grid-cols-1 sm:grid-cols-2" />

      <CheckboxGroup legend={emailText(language, "months.legend")} hint={limit(MAX_MONTHS)} options={monthOptions}
        selected={answers.months} max={MAX_MONTHS} onToggle={(month) => set({ months: toggleLimited(answers.months, month, MAX_MONTHS) })} columns="grid-cols-2 sm:grid-cols-3" />

      <CheckboxGroup legend={emailText(language, "tripTypes.legend")} hint={limit(MAX_TRIP_TYPES)} options={typeOptions}
        selected={answers.tripTypes} max={MAX_TRIP_TYPES} onToggle={(type) => set({ tripTypes: toggleLimited(answers.tripTypes, type, MAX_TRIP_TYPES) })} columns="grid-cols-1 sm:grid-cols-2" />

      <SelectField id="email-pref-length" language={language} legendKey="length.legend" value={answers.tripLength} options={LENGTH_OPTIONS} onChange={(value) => set({ tripLength: value as TripLength })} />
      <SelectField id="email-pref-reach" language={language} legendKey="reach.legend" value={answers.reach} options={REACH_OPTIONS} onChange={(value) => set({ reach: value as Reach })} />
      <SelectField id="email-pref-budget" language={language} legendKey="budget.legend" value={answers.flightBudget} options={BUDGET_OPTIONS} onChange={(value) => set({ flightBudget: value as FlightBudget })} />
      <SelectField id="email-pref-frequency" language={language} legendKey="frequency.legend" value={answers.frequency} options={FREQUENCY_OPTIONS} onChange={(value) => set({ frequency: value as Frequency })} />

      <div className="rounded-xl border border-stone-300 bg-white p-3">
        <label className="flex items-start gap-3 text-sm leading-6">
          <input type="checkbox" checked={answers.consent} disabled={!complete && !answers.consent} aria-describedby="email-pref-consent-help"
            onChange={(event) => set({ consent: event.target.checked })} className="mt-1 h-5 w-5 shrink-0 accent-blue-700" />
          <span className="min-w-0">{emailText(language, "consent.label")}</span>
        </label>
        <div id="email-pref-consent-help" className="mt-2 space-y-1 text-xs leading-5 text-stone-600">
          {!complete && <p>{emailText(language, "consent.needs")}</p>}
          <p><Link href="/privacidad" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline hover:text-blue-800">{emailText(language, "consent.privacy")}</Link></p>
          {givenDate && <p>{emailText(language, "consent.recorded", { date: givenDate })}</p>}
          {withdrawnDate && <p>{emailText(language, "consent.withdrawn", { date: withdrawnDate })}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={disabled || (answers.consent && !complete)} className="min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
          {busy === "saving" ? emailText(language, "saving") : emailText(language, "save")}
        </button>
        {hasSavedRow && (
          <button type="button" onClick={onDelete} disabled={disabled} className="min-h-[44px] rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-red-300 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
            {busy === "deleting" ? emailText(language, "deleting") : emailText(language, "delete")}
          </button>
        )}
      </div>
      <p role={notice === "saveError" || notice === "deleteError" ? "alert" : "status"} aria-live="polite" className={`text-sm leading-6 ${notice === "saveError" || notice === "deleteError" ? "text-red-700" : "text-stone-700"}`}>
        {notice ? emailText(language, NOTICE_KEY[notice]) : ""}
      </p>
    </form>
  );
}
