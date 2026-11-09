import { ImageResponse } from "next/og";
import { hero, profile, site } from "@/data/content";

export const alt = `${profile.name} — ${hero.subtitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Open Graph / Twitter card, rendered at build time in the site's visual style. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: `radial-gradient(ellipse at 50% 30%, ${site.accent}33, #060606 62%)`,
          color: "#f4f4f5",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 120,
            display: "flex",
            justifyContent: "center",
            fontSize: 250,
            fontWeight: 900,
            letterSpacing: -10,
            color: "transparent",
            WebkitTextStroke: `2px ${site.accent}66`,
          }}
        >
          {hero.outlineWord}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 4, color: "#a1a1aa" }}>
          <span style={{ color: site.accent }}>{hero.sectionLabel}</span>
          <span>{site.domain.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 34, color: "#a1a1aa", marginBottom: 12 }}>{hero.greeting}</div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div
              style={{
                display: "flex",
                background: site.accent,
                color: "#fff",
                fontSize: 150,
                fontWeight: 900,
                lineHeight: 1,
                padding: "6px 22px 0",
                letterSpacing: -6,
                fontFamily: "sans-serif",
              }}
            >
              {profile.shortName.toUpperCase()}
            </div>
            <div style={{ display: "flex", fontSize: 150, fontWeight: 900, lineHeight: 1, color: site.accent, fontFamily: "sans-serif" }}>.</div>
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 24, letterSpacing: 5, color: "#f4f4f5" }}>
            <span style={{ color: site.accent, marginRight: 14 }}>●</span>
            {hero.subtitle.toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, letterSpacing: 3, color: "#71717a" }}>
          <span>{profile.location.toUpperCase()}</span>
          <span>FLUTTER · NEXT.JS · PHP · FINTECH</span>
        </div>
      </div>
    ),
    size,
  );
}
