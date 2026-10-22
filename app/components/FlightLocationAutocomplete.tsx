"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from './LanguageProvider';

type Suggestion = {
  type: "city" | "airport";
  name: string;
  country: string;
  code: string | null;
  cityName: string | null;
  cityCode: string | null;
  physicalCityName?: string;
  scheduledPassengerService?: boolean;
  serviceNotice?: 'noScheduledFlights' | 'antwerpTuiEnds' | 'charleroiTransfer' | 'euroAirportShared' | 'limitedSeasonalFlights';
};

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: Suggestion, value: string) => void;
  placeholder: string;
  variant: "main" | "modal";
};

type PopupPosition = { top?: number; bottom?: number; left: number; width: number; maxHeight: number };

export default function FlightLocationAutocomplete({ label, value, onChange, onSelect, placeholder, variant }: Props) {
  const { t } = useLanguage();
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const skipNextLookup = useRef(false);
  const [lookupVersion, setLookupVersion] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<PopupPosition | null>(null);

  useEffect(() => {
    if (skipNextLookup.current) {
      skipNextLookup.current = false;
      return;
    }
    const term = value.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/travelpayouts/places?term=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Autocomplete unavailable");
        const payload: unknown = await response.json();
        const next = payload && typeof payload === "object" && "suggestions" in payload &&
          Array.isArray(payload.suggestions) ? payload.suggestions as Suggestion[] : [];
        setSuggestions(next);
        setActiveIndex(-1);
        setOpen(next.length > 0 && document.activeElement === inputRef.current);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setOpen(false);
        }
      }
    }, 275);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value, lookupVersion]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(Math.max(rect.width, 280), window.innerWidth - 16);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      setPosition({
        left,
        width,
        maxHeight: Math.min(312, Math.max(below >= 180 ? below : above, 80)),
        ...(below >= 180 || below >= above
          ? { top: rect.bottom + 4 }
          : { bottom: window.innerHeight - rect.top + 4 }),
      });
    }

    function closeOnOutside(event: Event) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("focusin", closeOnOutside);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("focusin", closeOnOutside);
    };
  }, [open]);

  function selectSuggestion(suggestion: Suggestion) {
    if (suggestion.scheduledPassengerService === false) return;
    // The existing flight search resolves cities. An airport selection uses its official city.
    const selectedCity = suggestion.type === "airport"
      ? suggestion.cityName || suggestion.cityCode || suggestion.name
      : suggestion.name;
    skipNextLookup.current = true;
    onChange(selectedCity);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
    onSelect?.(suggestion, selectedCity);
  }

  const inputClassName = variant === "main"
    ? "mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
    : "w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none focus:border-cyan-300/50";

  return (
    <div ref={rootRef} className="min-w-0">
      <label className={variant === "main" ? "block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]" : "block"}>
        {variant === "modal" ? <span className="mb-2 block text-sm text-slate-300">{label}</span> : label}
        <input
          ref={inputRef}
          required
          type="text"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-suggestions`}
          aria-activedescendant={open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          value={value}
          onChange={(event) => {
            skipNextLookup.current = false;
            setOpen(false);
            setSuggestions([]);
            onChange(event.target.value);
          }}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
            else if (value.trim().length >= 2) {
              skipNextLookup.current = false;
              setLookupVersion((version) => version + 1);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              return;
            }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              const selectable = suggestions.map((s, i) => s.scheduledPassengerService === false ? -1 : i).filter(i => i >= 0);
              if (!selectable.length) { event.preventDefault(); return; }
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) => {
                const current = selectable.indexOf(index);
                return selectable[event.key === 'ArrowDown' ? (current + 1) % selectable.length
                  : current < 0 ? selectable.length - 1 : (current - 1 + selectable.length) % selectable.length];
              });
            }
            if (event.key === 'Enter' && open && suggestions.length && suggestions.every(s => s.scheduledPassengerService === false)) {
              event.preventDefault();
              return;
            }
            if (event.key === "Enter" && open && activeIndex >= 0) {
              event.preventDefault();
              selectSuggestion(suggestions[activeIndex]);
            }
          }}
          placeholder={placeholder}
          className={inputClassName}
        />
      </label>
      {open && position && createPortal(
        <ul
          ref={listRef}
          id={`${id}-suggestions`}
          role="listbox"
          aria-label={label}
          className="fixed z-[100] overflow-y-auto rounded-xl border border-blue-200 bg-white py-1 text-sm text-slate-900 shadow-xl"
          style={position}
        >
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.type}-${suggestion.code ?? suggestion.name}-${index}`} id={`${id}-option-${index}`} role="option" aria-selected={activeIndex === index} aria-disabled={suggestion.scheduledPassengerService === false || undefined}>
              <button
                type="button"
                disabled={suggestion.scheduledPassengerService === false}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => { if (suggestion.scheduledPassengerService !== false) setActiveIndex(index); }}
                onClick={() => selectSuggestion(suggestion)}
                className={`flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-600 ${activeIndex === index ? "bg-blue-50" : ""}`}
              >
                <span className="min-w-0 break-words">
                  <span className="font-semibold">{suggestion.name}</span>
                  {suggestion.type === "airport" && (suggestion.physicalCityName || suggestion.cityName) && (suggestion.physicalCityName || suggestion.cityName) !== suggestion.name
                    ? <span className="text-slate-500"> · {suggestion.physicalCityName || suggestion.cityName}</span> : null}
                  {suggestion.country ? <span className="text-slate-500">, {suggestion.country}</span> : null}
                  {suggestion.serviceNotice ? <span className="mt-1 block text-xs leading-4 text-stone-600">{t(`search.airportNotice.${suggestion.serviceNotice}`)}</span> : null}
                </span>
                {suggestion.code ? <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-bold text-blue-700">{suggestion.code}</span> : null}
              </button>
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}
