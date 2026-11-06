"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";

/**
 * Images optimisées :
 *  - Unsplash : redimensionnement + AVIF/WebP par leur CDN (auto=format), sans coût d'optimisation ;
 *  - autres (Vercel Blob, fichiers locaux) : optimiseur Next.js (AVIF/WebP, tailles responsives).
 */
const unsplashLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 72));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
};

export function Img({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  const isUnsplash = typeof src === "string" && src.startsWith("https://images.unsplash.com/");
  return <Image src={src} alt={alt} loader={isUnsplash ? unsplashLoader : undefined} {...props} />;
}
