import { Monogram } from "@/components/brand/monogram";
import { LineReveal, Parallax, Reveal } from "@/components/motion/reveal";
import { LinkButton } from "@/components/ui/button";
import { Img } from "@/components/ui/img";
import { telHref } from "@/lib/utils";

/** Grand appel final à la prise de rendez-vous. */
export function CtaBand({
  eyebrow,
  title,
  body,
  image,
  phone,
  phoneE164,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: { url: string; alt: string } | null;
  phone: string;
  phoneE164: string;
}) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-noir">
      {image && (
        <Parallax className="absolute inset-0 -z-20" strength={80}>
          <Img src={image.url} alt="" fill sizes="100vw" className="object-cover opacity-45" />
        </Parallax>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-noir via-noir/80 to-noir/40" />
      <Monogram aria-hidden title="" className="pointer-events-none absolute -right-[6%] top-1/2 -z-10 w-[46vw] -translate-y-1/2 text-champagne/[0.08]" />
      <div className="container-x py-28 md:py-40">
        <div className="max-w-3xl">
          <Reveal y={10}>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
          <LineReveal text={title} className="t-h1 mt-6 text-ivoire" />
          <Reveal delay={0.2}>
            <p className="t-lead muted mt-8 max-w-xl">{body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LinkButton href="/contact" size="lg">
                Demander un rendez-vous
              </LinkButton>
              <LinkButton href={telHref(phoneE164)} variant="light" size="lg">
                Appeler le {phone}
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
