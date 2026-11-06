import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { IntroProvider } from "@/components/layout/intro-loader";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { BusinessJsonLd } from "@/components/site/json-ld";
import { LEGAL_NAV, MAIN_NAV, SECONDARY_NAV, filterNav } from "@/lib/content/navigation";
import { AnalyticsConsent } from "@/components/site/analytics-consent";
import { PreviewBar } from "@/components/site/preview-bar";
import { sectionOf } from "@/lib/content/get";
import { getAreas, getOffers, getPage, getPageStatuses, getSettings, isPreview } from "@/lib/data/public";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, statuses, offers, areas, preview, home] = await Promise.all([
    getSettings(),
    getPageStatuses(),
    getOffers(),
    getAreas(),
    isPreview(),
    getPage("home"),
  ]);
  const nav = filterNav(MAIN_NAV, statuses, settings.modules);
  const secondary = filterNav(SECONDARY_NAV, statuses, settings.modules);
  const bannerOffer = settings.modules.banner ? offers.find((o) => o.kind === "banniere") : undefined;
  const banner = bannerOffer
    ? { text: bannerOffer.description || bannerOffer.title, href: bannerOffer.ctaHref, cta: bannerOffer.ctaLabel }
    : null;
  // L'invitation au rendez-vous est éditée une seule fois (Accueil → « Invitation au rendez-vous ») et affichée partout.
  const cta = sectionOf(home, "cta");
  const invite = cta.visible ? { title: cta.text("title"), body: cta.text("body"), image: cta.image("image") } : null;

  return (
    <IntroProvider>
      <SmoothScroll />
      <Header
        nav={nav}
        secondary={secondary}
        phone={settings.business.phone}
        phoneE164={settings.business.phoneE164}
        email={settings.business.email}
        hours={settings.hours.summary}
        banner={banner}
        customLogo={settings.branding.logoDark && settings.branding.logoDark !== "/brand/logo-dark.svg" ? settings.branding.logoDark : null}
      />
      <main id="contenu">{children}</main>
      <Footer settings={settings} nav={nav} secondary={secondary} legal={LEGAL_NAV} invite={invite} />
      <MobileActionBar
        phoneE164={settings.business.phoneE164}
        whatsapp={settings.business.whatsappEnabled && settings.business.whatsappNumber ? settings.business.whatsappNumber : null}
      />
      <BusinessJsonLd settings={settings} areas={areas.map((a) => a.name)} />
      {preview && <PreviewBar path="/" />}
      <AnalyticsConsent gaId={settings.seo.gaMeasurementId} />
    </IntroProvider>
  );
}
