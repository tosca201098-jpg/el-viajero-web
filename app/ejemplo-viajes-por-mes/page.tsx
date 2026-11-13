import type { Metadata } from "next";
import MonthlyOffersExample from "./MonthlyOffersExample";

// Página de EJEMPLO para revisar el diseño. No se enlaza desde ninguna parte, no entra en el sitemap
// y los buscadores no la indexan. Los precios son datos reales consultados el 13-11-2026 desde Madrid.
export const metadata: Metadata = {
  title: "Ejemplo · Vuelos baratos en enero | Destinauta",
  robots: { index: false, follow: false },
};

export default function MonthlyOffersExamplePage() {
  return <MonthlyOffersExample />;
}
