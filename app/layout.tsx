import type { Metadata, Viewport } from "next";
import { Caveat, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import { company, credentials, experience, profile, site } from "@/data/content";
import { BUILD_BOOT_SCRIPT } from "@/lib/agent-build/boot";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${profile.shortName}`,
  },
  description: site.description,
  applicationName: site.domain,
  authors: [{ name: profile.name, url: site.url }],
  creator: profile.name,
  keywords: [
    profile.name,
    "Kelechi",
    "full-stack developer",
    "Flutter developer",
    "Next.js developer",
    "PHP developer",
    "fintech engineer",
    "mobile app developer Nigeria",
    "Aba",
    "Isaac Kelechi Software Limited",
    "kcibdev",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.domain,
    title: site.title,
    description: site.description,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    ...(site.twitterHandle ? { creator: `@${site.twitterHandle}`, site: `@${site.twitterHandle}` } : {}),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { email: false, telephone: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#060606",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

/** Structured data so search engines understand who this page is about. */
function personJsonLd() {
  const sameAs = profile.socials.map((s) => s.href).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    alternateName: profile.shortName,
    url: site.url,
    jobTitle: profile.role,
    email: `mailto:${profile.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Aba",
      addressRegion: "Abia State",
      addressCountry: "NG",
    },
    worksFor: {
      "@type": "Organization",
      name: company.name,
      identifier: `RC ${company.rcNumber}`,
      foundingDate: "2025-12-30",
    },
    alumniOf: { "@type": "CollegeOrUniversity", name: experience.education.school },
    knowsAbout: ["Flutter", "Dart", "PHP", "Next.js", "React", "Node.js", "TypeScript", "Fintech", "Solidity"],
    hasCredential: credentials.items.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.title,
      credentialCategory: c.kind,
      recognizedBy: { "@type": "Organization", name: c.issuer },
      ...(c.verify ? { url: c.verify } : {}),
    })),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrains.variable} ${caveat.variable}`}
      style={{ "--accent": site.accent } as CSSProperties}
      // The boot script may add data-ab before hydration.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint: decides whether the agent build should play. */}
        <script dangerouslySetInnerHTML={{ __html: BUILD_BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
