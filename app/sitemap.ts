import type { MetadataRoute } from "next";
import { spanishMonthSlugs } from "@/lib/destinations/months";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    ...spanishMonthSlugs.map((month) => ({
      url: `${siteUrl}/viajes-baratos/${month}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
