import { ImageResponse } from "next/og";

// Image Open Graph par défaut (1200×630) — héritée par toutes les routes qui
// ne définissent pas la leur. Générée au build via next/og (Satori) : on reste
// sur flexbox + propriétés simples (pas de gradient/grid, non supportés), sobre,
// sur les tokens du design system Notion Club (fond near-black warm + accent brand).
export const alt =
  "Notivault — Sauvegardes automatiques et sécurisées pour Notion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#141211",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: "#e0625a",
              display: "flex",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 38,
              color: "#f2edeb",
              fontWeight: 700,
            }}
          >
            Notivault
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 90,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#e0625a",
              marginBottom: 28,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 62,
              color: "#f2edeb",
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 920,
            }}
          >
            Vos données Notion, sauvegardées automatiquement.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#a89e9b",
              marginTop: 24,
              maxWidth: 880,
            }}
          >
            Vers votre propre stockage. Vous gardez le contrôle.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
