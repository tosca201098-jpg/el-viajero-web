import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { monthFromSlug, spanishMonthSlugs } from "@/lib/destinations/months";
import { getMonthlyRecommendations } from "@/lib/destinations/monthly";
import MonthlyDestinations from "./MonthlyDestinations";

type MonthPageProps = { params: { mes: string } };

export const dynamicParams = false;

export function generateStaticParams() {
  return spanishMonthSlugs.map((mes) => ({ mes }));
}

export function generateMetadata({ params }: MonthPageProps): Metadata {
  if (monthFromSlug(params.mes) === null) notFound();
  return {
    metadataBase: new URL("https://el-viajero-web-psi.vercel.app"),
    title: `Viajes recomendados en ${params.mes} | El Viajero`,
    description: `Descubre destinos recomendados para viajar en ${params.mes} según temporada, clima y demanda turística habitual.`,
    alternates: { canonical: `/viajes-baratos/${params.mes}` },
  };
}

export default function MonthPage({ params }: MonthPageProps) {
  const month = monthFromSlug(params.mes);
  if (month === null) notFound();
  return <MonthlyDestinations month={month} recommendations={getMonthlyRecommendations(month)} />;
}
