import type { MetadataRoute } from "next";
import { profile, site } from "@/data/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} — ${site.domain}`,
    short_name: profile.shortName,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#060606",
    theme_color: "#060606",
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }],
  };
}
