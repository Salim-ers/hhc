"use client";

import { usePathname } from "next/navigation";
import { Parallax, Reveal, TextReveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import { telHref } from "@/lib/utils";

export type Invite = { title: string; body: string; image: { url: string; alt: string } | null };

/**
 * L'unique invitation à prendre rendez-vous, en tête du pied de page de chaque page.
 * Inutile sur la page Contact, qui contient déjà le formulaire.
 */
export function FooterInvite({ invite, phone, phoneE164 }: { invite: Invite; phone: string; phoneE164: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/contact")) return null;
  return (
    <div className="container-x pt-3 md:pt-4">
      <div className="relative grid overflow-hidden rounded-[1.75rem] bg-espresso md:rounded-[2.5rem] lg:grid-cols-12">
        <div className="relative z-10 p-7 sm:p-12 lg:col-span-7 lg:p-16 xl:p-20">
          <TextReveal text={invite.title} className="t-h1 text-ivoire" />
          <Reveal delay={0.15}>
            <p className="t-lead muted mt-6 max-w-xl">{invite.body}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton href="/contact" size="lg" arrow>
                Demander un rendez-vous
              </LinkButton>
              <LinkButton href={telHref(phoneE164)} variant="light" size="lg">
                Appeler le {phone}
              </LinkButton>
            </div>
          </Reveal>
        </div>
        {invite.image && (
          <div className="relative min-h-[16rem] p-3 pt-0 sm:min-h-[22rem] lg:col-span-5 lg:min-h-0 lg:p-4 lg:pl-0">
            <Parallax className="h-full min-h-[inherit] rounded-[1.25rem] md:rounded-[2rem]" strength={50}>
              <Img src={invite.image.url} alt="" fill sizes="(min-width:1024px) 38vw, 100vw" className="object-cover" />
            </Parallax>
          </div>
        )}
      </div>
    </div>
  );
}
