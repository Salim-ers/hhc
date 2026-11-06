import Link from "next/link";
import { Monogram, Tagline, Wordmark } from "@/components/brand/monogram";
import { FooterInvite, type Invite } from "@/components/layout/footer-invite";
import type { NavItem } from "@/lib/content/navigation";
import type { SiteSettings } from "@/lib/data/types";
import { telHref } from "@/lib/utils";

const linkCls = "link-underline text-ivoire/80 transition-colors hover:text-ivoire";
const headingCls = "mb-5 font-sans text-sm text-ivoire/45";

export function Footer({
  settings,
  nav,
  secondary,
  legal,
  invite,
}: {
  settings: SiteSettings;
  nav: NavItem[];
  secondary: NavItem[];
  legal: NavItem[];
  invite: Invite | null;
}) {
  const { business: b, hours: h, social, travel } = settings;
  const year = new Date().getFullYear();
  return (
    <footer className="panel on-dark grain relative overflow-hidden bg-noir pb-28 md:pb-10">
      {invite && <FooterInvite invite={invite} phone={b.phone} phoneE164={b.phoneE164} />}
      <div className="container-x relative pt-16 md:pt-20">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" aria-label="Hair Home Concept, accueil" className="inline-block rounded-2xl">
              <Monogram className="h-14 w-auto text-or-logo" title="" aria-hidden />
              <Wordmark className="mt-6 h-6 w-auto text-ivoire" />
              <Tagline className="mt-3 h-3 w-auto text-or-logo/90" />
            </Link>
            <p className="muted mt-8 max-w-sm">
              {b.ownerName}, {b.ownerTitle.toLowerCase()}. Coiffure haut de gamme exclusivement à domicile, à {b.city}, Troyes et dans
              l&apos;agglomération.
            </p>
          </div>

          <nav aria-label="Plan du site" className="grid grid-cols-2 gap-10 sm:grid-cols-[1fr_1fr_1.35fr] lg:col-span-7">
            <div>
              <h2 className={headingCls}>Le site</h2>
              <ul className="space-y-2.5">
                {nav.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className={linkCls}>
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className={headingCls}>Pratique</h2>
              <ul className="space-y-2.5">
                {secondary.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className={linkCls}>
                      {i.label}
                    </Link>
                  </li>
                ))}
                {social.facebook && (
                  <li>
                    <a href={social.facebook} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      Facebook
                    </a>
                  </li>
                )}
                {social.instagram && (
                  <li>
                    <a href={social.instagram} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      Instagram
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className={headingCls}>Contact</h2>
              <address className="space-y-2.5 not-italic">
                <a href={telHref(b.phoneE164)} className="block font-display text-2xl text-ivoire">
                  {b.phone}
                </a>
                <a href={`mailto:${b.email}`} className="link-underline block break-words text-ivoire/80">
                  {b.email}
                </a>
                <p className="muted text-sm">{h.summary}</p>
                <p className="muted text-sm">{travel.included}</p>
              </address>
            </div>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ivoire/10 pt-8 text-sm text-ivoire/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {b.name}. Service de coiffure à domicile, sans accueil en salon.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="link-underline hover:text-ivoire">
                  {i.label}
                </Link>
              </li>
            ))}
            <li>Photographies d&apos;illustration : Unsplash</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
