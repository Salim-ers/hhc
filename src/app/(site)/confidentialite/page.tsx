import { LegalBody, LegalShell } from "@/components/sections/legal-page";
import { sectionOf } from "@/lib/content/get";
import { getPage, getSettings } from "@/lib/data/public";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("confidentialite");

export default async function ConfidentialitePage() {
  const [page, s] = await Promise.all([getPage("confidentialite"), getSettings()]);
  return (
    <LegalShell title="Politique de confidentialité">
      <LegalBody text={sectionOf(page, "content").text("body")} />
      <p className="mt-12 max-w-3xl">
        Responsable du traitement : {s.legal.legalName}, {s.business.email}
      </p>
    </LegalShell>
  );
}
