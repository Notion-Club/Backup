import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/shared/components/theme/ThemeProvider";
import { sfProDisplay } from "@/shared/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://notivault.fr"),
  title: {
    default: "Notivault — Sauvegarde automatique pour Notion",
    template: "%s — Notivault",
  },
  description:
    "Sauvegardes automatiques et sécurisées de vos workspaces Notion vers votre propre stockage.",
  applicationName: "Notivault",
  keywords: [
    "backup Notion",
    "sauvegarde Notion",
    "sauvegarde automatique Notion",
    "Notion backup",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Notivault",
    url: "https://notivault.fr",
    title: "Notivault — Sauvegarde automatique pour Notion",
    description:
      "Sauvegardes automatiques et sécurisées de vos workspaces Notion vers votre propre stockage.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notivault — Sauvegarde automatique pour Notion",
    description:
      "Sauvegardes automatiques et sécurisées de vos workspaces Notion vers votre propre stockage.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2f2" },
    { media: "(prefers-color-scheme: dark)", color: "#141211" },
  ],
};

// Inline script runs before paint to avoid a flash of incorrect theme.
// Stored preference can be "light" | "dark" | "system"; "system" falls back
// to prefers-color-scheme.
const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem('theme');if(p!=='light'&&p!=='dark'&&p!=='system')p='system';var t=p;if(p==='system'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sfProDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans">
        {/* Le fond nc-page-halo et le chrome (header/footer, shell d'app) sont
            portés par les layouts de groupe : (marketing), (auth), (app). */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
