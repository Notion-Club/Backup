import { SiteHeader } from "@/shared/components/marketing/SiteHeader";
import { SiteFooter } from "@/shared/components/marketing/SiteFooter";

// Layout des pages publiques : fond nc-page-halo + header/footer marketing.
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="nc-page-halo flex flex-col" style={{ minHeight: "100dvh" }}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
