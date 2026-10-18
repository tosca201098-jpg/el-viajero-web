import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { monthFromSlug, spanishMonthSlugs } from "@/lib/destinations/months";
import { getMonthlyRecommendations } from "@/lib/destinations/monthly";
import { siteUrl } from "@/lib/seo";
import MonthlyDestinations from "./MonthlyDestinations";

type MonthPageProps = { params: { mes: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return spanishMonthSlugs.map((mes) => ({ mes }));
}

export function generateMetadata({ params }: MonthPageProps): Metadata {
  if (monthFromSlug(params.mes) === null) notFound();
  const title = `Viajes recomendados en ${params.mes} | Destinauta`;
  const description = `Descubre destinos recomendados para viajar en ${params.mes} según temporada, clima y demanda turística habitual.`;
  const path = `/viajes-baratos/${params.mes}`;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: "Destinauta", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default function MonthPage({ params }: MonthPageProps) {
  const month = monthFromSlug(params.mes);
  if (month === null) notFound();
  return <MonthlyDestinations month={month} recommendations={getMonthlyRecommendations(month)} />;
}
