"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { answerChat, MAX_CHAT_INPUT, type ChatMonthFit, type ChatPeriod, type ChatPlace, type ChatReply } from "@/lib/chat/guided";
import type { ChatTopicKey } from "@/lib/chat/vocabulary";
import type { TranslationKey } from "@/lib/i18n/translations";
import { useLanguage } from "./LanguageProvider";

type Message = { id: number; from: "user" | "bot"; text?: string; reply?: ChatReply };
type Props = {
  /** Opens the destination window of the home page (the same one Sofía opens). */
  onOpenDestination: (id: string) => void;
  /** Brings the visitor to the flight search of the home page; with `discover` it also switches on «I don't know where to go». */
  onOpenFlightSearch: (options?: { discover?: boolean }) => void;
  /** True while a window of the page (destination, search, results, sign-in) is open: the chat steps aside, keeping its conversation. */
  hidden?: boolean;
};

const SAMPLES: TranslationKey[] = ["chat.sample1", "chat.sample2", "chat.sample3"];
/** The topics offered as quick buttons to someone who has not decided where to go. */
const UNDECIDED_TOPICS: ChatTopicKey[] = ["beach", "mountain", "museums", "nature", "snow", "islands"];
const actionClass = "min-h-[44px] rounded-xl border border-blue-300 bg-white px-3 py-2 text-left text-sm font-semibold text-blue-800 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

/**
 * A small written chat that only talks about DESTINAUTA. Every answer comes from the site's own catalogue (see
 * lib/chat/guided.ts): no AI, no cost, and never a price or an availability.
 */
export default function GuidedChat({ onOpenDestination, onOpenFlightSearch, hidden = false }: Props) {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastQuestionRef = useRef<HTMLDivElement | null>(null);
  const counter = useRef(0);

  useEffect(() => { if (open && !hidden) inputRef.current?.focus(); }, [open, hidden]);
  // The newest question goes to the top of the list, so its answer is read from its first line.
  useEffect(() => { lastQuestionRef.current?.scrollIntoView?.({ block: "start" }); }, [messages, open, hidden]);

  const lastQuestionId = [...messages].reverse().find((message) => message.from === "user")?.id;
  const cap = (value: string) => value.charAt(0).toLocaleUpperCase(language) + value.slice(1);

  function submit(text: string) {
    const clean = text.trim();
    if (!clean) return;
    const reply = answerChat(clean, language);
    setMessages((current) => [...current,
      { id: ++counter.current, from: "user", text: clean },
      { id: ++counter.current, from: "bot", reply }]);
    setDraft("");
  }

  function openDestination(id: string) {
    setOpen(false);
    onOpenDestination(id);
  }

  function filters(country?: string, period?: ChatPeriod, topic?: string) {
    const parts: string[] = [];
    if (country) parts.push(country);
    if (period) parts.push(period.season ? t(`chat.season.${period.season}` as TranslationKey) : period.months.join(" / "));
    if (topic) parts.push(t(`chat.topic.${topic}` as TranslationKey));
    return parts.join(" · ");
  }

  function renderFit(fit: ChatMonthFit) {
    return (
      <p className="mt-2 text-sm font-semibold text-blue-900">
        {fit.best ? t("chat.fitBest", { month: cap(fit.month) }) : t("chat.fitNotBest", { month: cap(fit.month) })}
        {fit.best && fit.busy ? ` ${t("chat.fitBusy", { month: cap(fit.month) })}` : ""}
      </p>
    );
  }

  function renderPlace(place: ChatPlace, fit: ChatMonthFit | undefined, detailed: boolean) {
    return (
      <article key={place.id} className="rounded-xl border border-stone-200 bg-white p-3">
        <h3 className="font-bold leading-snug">{place.name} <span className="font-normal text-stone-500">· {place.country}</span></h3>
        {detailed && <p className="mt-1 text-sm text-stone-700">{place.description}</p>}
        {fit && renderFit(fit)}
        {place.bestMonths && <p className="mt-1 text-sm text-stone-700">{t("chat.bestMonths", { months: place.bestMonths })}</p>}
        {detailed && place.quietMonths && <p className="text-sm text-stone-700">{t("chat.quietMonths", { months: place.quietMonths })}</p>}
        {detailed && place.busyMonths && <p className="text-sm text-stone-700">{t("chat.busyMonths", { months: place.busyMonths })}</p>}
        {detailed && place.recommendedStay && <p className="text-sm text-stone-700">{t("chat.stay", { stay: place.recommendedStay })}</p>}
        {detailed && place.recommendations && place.recommendations.length > 0 && (
          <div className="mt-2 text-sm text-stone-700">
            <p className="font-semibold">{t("chat.highlights")}</p>
            <ul className="list-disc pl-5">{place.recommendations.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        )}
        {detailed && place.seasonalityNote && <p className="mt-2 text-sm text-stone-600">{place.seasonalityNote}</p>}
        <button type="button" onClick={() => openDestination(place.id)} className={`${actionClass} mt-2 w-full`}>
          {t("chat.openCard", { name: place.name })}
        </button>
      </article>
    );
  }

  function renderSamples() {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {SAMPLES.map((key) => (
          <button key={key} type="button" onClick={() => submit(t(key))} className={actionClass}>{t(key)}</button>
        ))}
      </div>
    );
  }

  function renderPriceNote() {
    return <p className="mt-2 text-xs text-stone-600">{t("chat.priceNote")}</p>;
  }

  function renderReply(reply: ChatReply) {
    switch (reply.kind) {
      case "welcome":
        return <p>{t("chat.welcome")}</p>;
      case "tooLong":
        return <p>{t("chat.tooLong")}</p>;
      case "unknown":
        return <><p>{t("chat.unknown")}</p>{renderSamples()}</>;
      case "undecided":
        return (
          <>
            <p>{t("chat.undecided")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {UNDECIDED_TOPICS.map((topic) => {
                const label = t(`chat.topic.${topic}` as TranslationKey);
                return <button key={topic} type="button" onClick={() => submit(label)} className={actionClass}>{cap(label)}</button>;
              })}
            </div>
            <p className="mt-3">{t("chat.undecidedSearch")}</p>
            <div className="mt-2">
              <button type="button" onClick={() => { setOpen(false); onOpenFlightSearch({ discover: true }); }} className={actionClass}>{t("chat.openDiscover")}</button>
            </div>
          </>
        );
      case "prices":
        return (
          <>
            <p>{t("chat.prices")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => { setOpen(false); onOpenFlightSearch(); }} className={actionClass}>{t("chat.searchFlights")}</button>
              <Link href="/hoteles" className={actionClass}>{t("chat.searchHotels")}</Link>
            </div>
          </>
        );
      case "destination":
        return (
          <div className="space-y-2">
            {reply.places.map(({ place, fit }) => renderPlace(place, fit, true))}
            {reply.priceNote && renderPriceNote()}
          </div>
        );
      case "list":
        return (
          <div className="space-y-2">
            <p className="font-semibold">{t("chat.listIntro", { filters: filters(reply.country, reply.period, reply.topic) })}</p>
            {reply.places.map((place) => renderPlace(place, undefined, false))}
            <p className="text-sm text-stone-700">
              {reply.total !== null && reply.total > reply.places.length
                ? t("chat.listMore", { shown: reply.places.length, total: reply.total })
                : t("chat.listRefine")}
            </p>
            {reply.priceNote && renderPriceNote()}
          </div>
        );
      case "none":
        return (
          <>
            <p>{t("chat.none", { filters: filters(reply.country, reply.period, reply.topic) })}</p>
            {renderSamples()}
            {reply.priceNote && renderPriceNote()}
          </>
        );
    }
  }

  if (hidden) return null;

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} aria-label={t("chat.open")}
        className="fixed bottom-4 right-4 z-50 flex min-h-[48px] items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 max-sm:bottom-3 max-sm:right-3">
        <span aria-hidden="true">💬</span>{t("chat.title")}
      </button>
    );
  }

  return (
    <section role="dialog" aria-label={t("chat.title")}
      onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
      className="fixed bottom-3 right-3 z-[55] flex max-h-[min(36rem,calc(100dvh-1.5rem))] w-[calc(100vw-1.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-blue-200 bg-stone-50 text-stone-800 shadow-2xl">
      <header className="flex items-center justify-between gap-3 bg-blue-600 px-4 py-2 text-white">
        <h2 className="text-base font-bold">{t("chat.title")}</h2>
        <button type="button" onClick={() => setOpen(false)} aria-label={t("chat.close")}
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">×</button>
      </header>
      <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 text-sm">
        <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm">
          <p>{t("chat.welcome")}</p>
          <p className="mt-2 text-xs text-stone-600">{t("chat.scope")}</p>
          {renderSamples()}
        </div>
        {messages.map((message) => message.from === "user" ? (
          <div key={message.id} ref={message.id === lastQuestionId ? lastQuestionRef : undefined}
            className="ml-auto max-w-[85%] scroll-mt-2 break-words rounded-2xl rounded-tr-sm bg-blue-600 p-3 text-white">{message.text}</div>
        ) : (
          <div key={message.id} className="max-w-[96%] rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm">{message.reply && renderReply(message.reply)}</div>
        ))}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); submit(draft); }} className="flex items-center gap-2 border-t border-stone-200 bg-white p-2">
        <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={MAX_CHAT_INPUT}
          placeholder={t("chat.placeholder")} aria-label={t("chat.placeholder")} autoComplete="off" enterKeyHint="send"
          className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-stone-300 px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        <button type="submit" disabled={!draft.trim()}
          className="min-h-[44px] shrink-0 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">{t("chat.send")}</button>
      </form>
    </section>
  );
}
