import { LegalBody, LegalShell } from "@/components/sections/legal-page";
import { sectionOf } from "@/lib/content/get";
import { getPage, getSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("mentions-legales");

export default async function MentionsPage() {
  const [page, s] = await Promise.all([getPage("mentions-legales"), getSettings()]);
  const l = s.legal;
  const rows: [string, string][] = [
    ["Éditeur du site", `${l.legalName}`],
    ["Forme juridique", l.legalForm],
    ["SIRET", l.siret],
    ["Immatriculation", l.registry],
    ["Siège", l.address],
    ["Directrice de la publication", l.publisher],
    ["Contact", `${s.business.phone} · ${s.business.email}`],
    ...(l.vat ? ([["TVA intracommunautaire", l.vat]] as [string, string][]) : []),
    ["Hébergement du site", l.host],
    ["Base de données", l.dataHost],
  ];
  return (
    <LegalShell title="Mentions légales">
      <dl className="mb-16 max-w-3xl divide-y divide-encre/10 border-y border-encre/10">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-4 sm:grid-cols-3">
            <dt className="text-sm text-taupe">{k}</dt>
            <dd className="sm:col-span-2">{v}</dd>
          </div>
        ))}
      </dl>
      <LegalBody text={sectionOf(page, "content").text("body")} />
    </LegalShell>
  );
}
