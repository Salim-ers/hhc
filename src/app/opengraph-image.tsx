import { ImageResponse } from "next/og";
import { MONOGRAM_PATH, MONOGRAM_VIEWBOX } from "@/components/brand/paths";

export const alt = "Hair Home Concept — coiffure haut de gamme à domicile à Troyes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#101010", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#F5F0E8" }}>
        <svg viewBox={MONOGRAM_VIEWBOX} width={300} height={200}>
          <path d={MONOGRAM_PATH} fill="#D8A301" fillRule="evenodd" />
        </svg>
        <div style={{ marginTop: 40, fontSize: 56, letterSpacing: 2 }}>Hair Home Concept</div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#C7A76C" }}>L’art de la coiffure, chez vous — Troyes &amp; Sainte-Savine</div>
      </div>
    ),
    size,
  );
}
