import { notFound } from "next/navigation";
import { getPage, isPreview } from "@/lib/data/public";

/** Charge une page ; une page en brouillon renvoie une 404 (sauf en mode aperçu). */
export async function loadPublicPage(key: string) {
  const page = await getPage(key);
  if (!page) notFound();
  if (page.status === "draft" && !(await isPreview())) notFound();
  return page;
}
