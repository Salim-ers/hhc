import { BreadcrumbJsonLd } from "@/components/site/json-ld";
import { GalleryGrid } from "@/components/site/gallery-grid";
import { PageIntro } from "@/components/sections/page-intro";
import { sectionOf } from "@/lib/content/get";
import { GALLERY_CATEGORIES } from "@/lib/content/seed-data";
import { getGallery } from "@/lib/data/public";
import { loadPublicPage } from "@/lib/page-guard";
import { pageMetadata } from "@/lib/seo";

export const generateMetadata = () => pageMetadata("galerie");

export default async function GaleriePage() {
  const page = await loadPublicPage("galerie");
  const items = await getGallery();
  const intro = sectionOf(page, "intro");
  const notice = sectionOf(page, "notice");
  return (
    <>
      <PageIntro title={intro.text("title")} subtitle={intro.text("subtitle")} />
      <section className="bg-lin pb-20 pt-10 md:pb-28 md:pt-14">
        <div className="container-x">
          <GalleryGrid items={items} categories={GALLERY_CATEGORIES} />
          {items.some((i) => i.isStock) && notice.text("text") && <p className="muted mt-10 max-w-2xl text-sm">{notice.text("text")}</p>}
        </div>
      </section>
      <BreadcrumbJsonLd items={[{ name: "Galerie", path: "/galerie" }]} />
    </>
  );
}
