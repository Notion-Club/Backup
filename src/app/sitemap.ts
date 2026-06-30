import type { MetadataRoute } from "next";

const BASE = "https://notivault.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/confidentialite`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/conditions`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/mentions-legales`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
