import { ImageResponse } from "next/og";
import { site } from "@/data/content";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: accent block with "K." — generated so it always matches site.accent. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: site.accent,
          borderRadius: 8,
          color: "#fff",
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        K.
      </div>
    ),
    size,
  );
}
