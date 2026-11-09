import { ImageResponse } from "next/og";
import { site } from "@/data/content";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#060606",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: site.accent,
            borderRadius: 10,
            color: "#fff",
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -4,
          }}
        >
          K.
        </div>
      </div>
    ),
    size,
  );
}
