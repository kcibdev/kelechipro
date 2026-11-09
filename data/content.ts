/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  kelechi.pro — all personal content lives here.
 *
 *  Edit this file to change copy, projects, links, stats and the accent colour.
 *  Components never hard-code personal content.
 *
 *  Search for "[PLACEHOLDER]" to find everything that still needs your input.
 *  Text written in **double asterisks** renders bold.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ──────────────────────────────── Types ──────────────────────────────── */

export type Category = "fintech" | "mobile" | "web" | "experiments";

export interface Project {
  /** Stable slug, used for keys and anchors. */
  slug: string;
  title: string;
  /** Small mono category label shown above the title. */
  label: string;
  summary: string;
  /** 2–4 short bullet details. */
  details: string[];
  tags: string[];
  /** Optional status chip, e.g. "In development". Only state what is true. */
  status?: string;
  /** Optional link (live site, store listing, repo, case study). */
  link?: { href: string; label: string };
  /** Which Systems Matrix filters this project appears under. */
  categories: Category[];
}

export interface Stat {
  label: string;
  /** null = not filled in yet. Renders "—" until you add a number. */
  value: number | null;
  suffix?: string;
  note?: string;
}

export interface Social {
  label: string;
  handle: string;
  /** Empty string = not set yet. The link renders as disabled until filled. */
  href: string;
}

export interface Role {
  title: string;
  company: string;
  period: string;
  location: string;
  /** Still in this role — shows an "Active" chip. */
  current?: boolean;
  points: string[];
}

export interface Credential {
  title: string;
  issuer: string;
  kind: string;
  date: string;
  /** Credential / certificate ID, if the document has one. */
  id?: string;
  /** Thumbnail in /public. */
  image: string;
  imageAlt: string;
  /** The full document in /public. */
  file: string;
  /** Public verification URL, if the issuer offers one. */
  verify?: string;
  note?: string;
}

/* ──────────────────────────────── Site ──────────────────────────────── */

export const site = {
  url: "https://kelechi.pro",
  domain: "kelechi.pro",
  title: "Kelechi — Full-Stack Engineer & Product Builder",
  description:
    "Isaac Kelechi Bright is a full-stack developer with 8+ years building Flutter apps, Next.js and PHP platforms and fintech systems used by 70000+ people. Founder of Isaac Kelechi Software Ltd.",
  /**
   * The single accent colour for the whole site (CSS, OG image, theme colour, build animation).
   * Options from the brief: crimson "#e11d48" or purple "#6e57e0".
   */
  accent: "#e11d48",
  locale: "en_NG",
  /** X/Twitter handle without "@", used for Twitter cards. Leave "" to omit. */
  twitterHandle: "kcibdev",
};

/* ──────────────────────────────── Company ──────────────────────────────── */

/**
 * Registered company details — from the CAC Certificate of Incorporation.
 * Only public-register facts are published here (no addresses, DOB or phone).
 */
export const company = {
  name: "Isaac Kelechi Software Limited",
  shortName: "Isaac Kelechi Software Ltd",
  rcNumber: "9141358",
  incorporated: "30 December 2025",
  type: "Private company limited by shares",
  registrar: "Corporate Affairs Commission (CAC), Nigeria",
  status: "Active",
  certificate: {
    file: "/company/certificate-of-incorporation.pdf",
    image: "/company/certificate-of-incorporation.jpg",
  },
  /** Public CAC search, where anyone can look up the RC number. */
  verify: "https://search.cac.gov.ng",
};

/* ──────────────────────────────── Profile ──────────────────────────────── */

export const profile = {
  name: "Isaac Kelechi Bright",
  shortName: "Kelechi",
  role: "Full-Stack Developer",
  brand: company.shortName,
  location: "Aba, Abia State, Nigeria",
  locationShort: "Aba, NG",
  email: "kcib.mail@gmail.com",
  /** Transparent cutout in /public (cropped from your photo, background removed). */
  portrait: "/portrait.png" as string | null,
  portraitAlt: "Portrait of Isaac Kelechi Bright",
  /** From your resume: "8+ years of experience". */
  yearsOfExperience: 8 as number | null,
  socials: [
    { label: "GitHub", handle: "@kcibdev", href: "https://github.com/kcibdev" },
    { label: "X", handle: "@kcibdev", href: "https://x.com/kcibdev" },
    { label: "LinkedIn", handle: "in/kcib", href: "https://www.linkedin.com/in/kcib" },
  ] satisfies Social[] as Social[],
  resume: {
    href: "/Isaac-Kelechi-Bright-Resume.pdf",
    fileName: "Isaac-Kelechi-Bright-Resume.pdf",
    preview: "/resume-preview.jpg",
    label: "Download CV",
    meta: "PDF · 3 pages · Nov 2026",
  },
};

/* ──────────────────────────────── Navigation ──────────────────────────────── */

export const nav = {
  links: [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "Projects", href: "#projects" },
    { label: "Company", href: "#company" },
    { label: "Contact", href: "#contact" },
  ],
  status: "Available",
  cta: { label: "Start a project", href: "#contact" },
};

/* ──────────────────────────────── Hero ──────────────────────────────── */

export const hero = {
  sectionLabel: "// 01.00 SEC_INDEX",
  index: "INDEX [01 / 09]",
  systemStatus: "SYSTEM ONLINE",
  /** Huge outlined word behind the hero. Short words (6–9 letters) fill the width best. */
  outlineWord: "ENGINEER",
  greeting: "Hello, I'm",
  subtitle: "Full-stack engineer & product builder",
  intro:
    "I design, build and maintain **production software across mobile and web** — from **Flutter apps on iOS and Android** to **Next.js and PHP platforms**, and the **payments, APIs and integrations** underneath them. **8+ years** in, I run my own registered company, **Isaac Kelechi Software Ltd**, and take on client work that needs to be built properly.",
  primaryCta: { label: "Start a project", href: "#contact" },
  secondaryCta: { label: "View projects", href: "#projects" },
  stats: [
    { label: "Years building", value: profile.yearsOfExperience, suffix: "+" },
    { label: "Active users", value: 70000, suffix: "+", note: "Across Apps" },
    { label: "Platforms", value: 3, note: "iOS · Android · Web" },
  ] satisfies Stat[] as Stat[],
  portraitStatus: "● ONLINE · ABA, NG",
  focus: [
    { n: "01", title: "Mobile", body: "Flutter apps on iOS and Android." },
    { n: "02", title: "Web", body: "Next.js and PHP platforms." },
    { n: "03", title: "Fintech & Systems", body: "Payments, APIs and integrations." },
  ],
  tags: ["Flutter", "Dart", "PHP", "Next.js", "React", "Node.js", "TypeScript", "MySQL", "Firebase", "MongoDB"],
  exploringLabel: "Also working with",
  exploring: ["Rust", "Solidity", "Blockchain", "Three.js", "Ollama"],
};

/* ──────────────────────────────── About ──────────────────────────────── */

export const about = {
  sectionLabel: "// 02.00 SEC_ABOUT",
  index: "INDEX [02 / 09]",
  heading: "Products, end to end.",
  /**
   * [PLACEHOLDER] Draft built from your resume profile — rewrite it in your own voice.
   */
  bio: [
    "I'm **Isaac Kelechi Bright** — most people call me Kelechi. For **8+ years** I've been designing, developing and maintaining **web and mobile applications** — scalable backends, intuitive interfaces, databases and API integrations — and taking them from concept to production.",
    "My work spans **fintech, utilities, workforce management, e-commerce and events** — WhatsApp-native banking for 1000+ users, electricity payments for Aba's power distributor with 60,000+ customers, field-team apps for Geometric Power, bill payments and livestreamed ticketing. I studied **Computer Science at Abubakar Tafawa Balewa University**, and in December 2025 I incorporated **Isaac Kelechi Software Ltd**.",
  ],
  /** [PLACEHOLDER] a line you actually stand behind. This one is a draft. */
  quote: "Build the whole system — the interface people touch and the infrastructure they never see.",
  principles: [
    {
      n: "01",
      title: "Ship the real thing",
      body: "Working software in people's hands beats a perfect plan. I build to release, then iterate on user feedback.",
    },
    {
      n: "02",
      title: "Own the full stack",
      body: "From the Flutter UI to the webhook handler and the database schema — one mind across every layer.",
    },
    {
      n: "03",
      title: "Engineer for trust",
      body: "Payments and personal data demand rigour: signed webhooks, verified identity, auditable flows.",
    },
  ],
};

/* ──────────────────────────────── Skills ──────────────────────────────── */

export const skills = {
  sectionLabel: "// 03.00 SEC_SKILLS",
  index: "INDEX [03 / 09]",
  heading: "Skills & stack.",
  lede: "The tools I reach for, grouped by layer. Everything here has shipped in a real project.",
  groups: [
    {
      id: "MOB",
      title: "Mobile",
      items: ["Flutter", "Dart", "Firebase", "Push notifications", "Maps & location", "Google Play", "App Store"],
    },
    {
      id: "FE",
      title: "Frontend",
      items: ["React.js", "Next.js", "TypeScript", "JavaScript", "jQuery", "HTML", "CSS", "Tailwind CSS", "Styled-Components"],
    },
    {
      id: "BE",
      title: "Backend & APIs",
      items: ["PHP", "Node.js", "Express.js", "Sequelize", "REST APIs", "GraphQL", "WhatsApp Cloud API"],
    },
    { id: "DB", title: "Data", items: ["MySQL", "MongoDB", "Firebase"] },
    { id: "W3", title: "Web3", items: ["Blockchain", "Solidity", "Smart contracts"] },
    { id: "UX", title: "Design", items: ["Figma", "Adobe Illustrator"] },
    { id: "OPS", title: "Ship & host", items: ["Git", "GitHub", "Vercel", "Netlify", "Heroku"] },
    { id: "LAB", title: "Exploring", items: ["Rust", "Three.js", "Ollama", "Local LLMs"] },
  ],
};

/* ──────────────────────────────── Experience ──────────────────────────────── */

export const experience = {
  sectionLabel: "// 04.00 SEC_EXPERIENCE",
  index: "INDEX [04 / 09]",
  heading: "Experience.",
  lede: "Roles from my resume, most recent and most relevant first.",
  roles: [
    {
      title: "Mobile App Developer",
      company: "Abapower — APLE",
      period: "Aug 2024 – Present",
      location: "Aba, Nigeria",
      current: true,
      points: [
        "Built Abapower Nkeanyi, a customer-facing Flutter app for buying electricity tokens",
        "Designed and implemented the mobile frontend for purchasing electricity and managing payments",
        "Integrated REST APIs for secure transaction processing and real-time data exchange",
      ],
    },
    {
      title: "Mobile App Developer",
      company: "Geometric Power Limited",
      period: "Aug 2024 – Present",
      location: "Aba, Nigeria",
      current: true,
      points: [
        "Built Smart WorkForce (SWF), an employee management app in Flutter for Android and iOS",
        "Designed core modules: attendance, asset enumeration, customer enumeration and metering",
        "Integrated location tracking, push notifications, map navigation and file storage for field teams",
      ],
    },
    {
      title: "Mobile App Developer",
      company: "LuliFiber — GoxHR",
      period: "Sep 2026 – Present",
      location: "Ikeja, Lagos",
      current: true,
      points: [
        "Designed and built the GoxHR employee management and self-service app in Flutter",
        "Implemented attendance, clock-in/out, leave management, profiles, requests and notifications",
        "Integrated REST APIs for data sync with the GoxHR HR management system",
      ],
    },
    {
      title: "Mobile App Developer",
      company: "Easy Pay Bills",
      period: "Sep 2023 – Present",
      location: "Port Harcourt, Nigeria",
      current: true,
      points: [
        "Designed and built two Flutter apps for Easy Pay Bills NG: a customer app and an agent app",
        "Implemented airtime and data purchases, electricity bills, wallet management and other bill payments",
        "Integrated REST APIs for transactions, account management and the platform's financial infrastructure",
      ],
    },
    {
      title: "Mobile App Developer",
      company: "Mamihub",
      period: "May 2026 – Jul 2026",
      location: "Nigeria",
      points: [
        "Designed and built a functional mobile e-commerce app with Flutter and Dart",
        "Implemented payment integration, clean architecture and a vendor dashboard",
      ],
    },
    {
      title: "Website Developer",
      company: "Velcro",
      period: "Jun 2026 – Aug 2026",
      location: "Nigeria",
      points: [
        "Built the Velcro Pay fintech web platform from the ground up — Next.js frontend, PHP backend",
        "Integrated third-party financial services and payment platforms",
        "Built and maintained core backend processing and external financial API communication",
      ],
    },
    {
      title: "WhatsApp Flow Developer",
      company: "VelcroPay",
      period: "Sep 2024 – Present",
      location: "Nigeria",
      current: true,
      points: [
        "Adapted the mobile app's core features into WhatsApp Flows, integrated with backend services",
        "Designed and built the backend infrastructure behind the WhatsApp banking platform",
        "Led the banking system from the ground up to production — serving 1000+ active users",
      ],
    },
    {
      title: "Mobile App Developer",
      company: "Candleweb",
      period: "2025 – Present",
      location: "Nigeria",
      current: true,
      points: ["Turned Figma designs into a working mobile app", "Implemented crypto features and their interface"],
    },
    {
      title: "Mobile App Developer",
      company: "Shuga Entertainment",
      period: "Nov 2024",
      location: "Nigeria",
      points: [
        "Designed and developed an event platform",
        "Implemented livestreaming and ticketing",
        "Shipped to Google Play and the App Store",
      ],
    },
    {
      title: "Mobile App Developer",
      company: "VelcroPay",
      period: "Aug 2023 – 2025",
      location: "Port Harcourt, Nigeria",
      points: [
        "Built a fintech mobile app from scratch in Flutter and Dart",
        "Implemented Firebase backend services to the client's spec",
        "Integrated third-party services such as gift cards and SME",
      ],
    },
    {
      title: "Frontend Developer",
      company: "Candleweb",
      period: "Feb 2023 – Aug 2023",
      location: "Abuja, Nigeria",
      points: [
        "Built a Web3 crypto website from scratch",
        "Worked alongside a backend developer and a UI/UX designer",
        "Added smart-contract functionality for crypto payments",
      ],
    },
  ] satisfies Role[] as Role[],
  education: {
    school: "Abubakar Tafawa Balewa University",
    course: "Computer Science",
    /** [PLACEHOLDER] your resume lists "Sep 2017" — add the end year / degree if you want. */
    period: "Sep 2017",
    location: "Bauchi, Nigeria",
  },
};

/* ──────────────────────────────── Projects ──────────────────────────────── */

const velcro: Project = {
  slug: "velcro",
  title: "Velcro",
  label: "FLAGSHIP // FINTECH",
  summary:
    "A WhatsApp-based fintech and banking platform. Users onboard, verify and move money without leaving the chat — with a Velcro Pay web platform alongside.",
  details: [
    "PHP core on the WhatsApp Cloud API, with WhatsApp Flows for KYC, onboarding and transfers",
    "Taken from the ground up to production — 1000+ active users",
    "Intent parsing with a local LLM (Phi-3 Mini via Ollama)",
    "BTC-to-NGN crypto offramp behind HMAC-secured webhooks",
    "In progress: Business API with KYB onboarding and virtual accounts",
  ],
  tags: ["PHP", "Next.js", "WhatsApp Cloud API", "Ollama"],
  categories: ["fintech", "web"],
};

const abapower: Project = {
  slug: "abapower",
  title: "Abapower",
  label: "CLIENT // ELECTRICITY",
  summary: "Abapower Nkeanyi — the customer app for APLE in Aba, where customers buy electricity tokens and manage payments.",
  details: [
    "Flutter frontend for buying tokens and managing payments",
    "Secure transactions over REST APIs, with real-time data",
    "Push notifications over FCM and APNs",
  ],
  tags: ["Flutter", "REST API", "FCM/APNs"],
  categories: ["mobile", "fintech"],
};

const geometric: Project = {
  slug: "geometric",
  title: "Geometric Power",
  label: "CLIENT // WORKFORCE",
  summary: "Smart WorkForce (SWF) — an employee management app for Geometric Power Limited's field teams, on Android and iOS.",
  details: [
    "Attendance, asset and customer enumeration, metering modules",
    "Location tracking, map navigation, push notifications and file storage",
  ],
  tags: ["Flutter", "Maps", "Push"],
  categories: ["mobile"],
};

const easypay: Project = {
  slug: "easypay",
  title: "EasyPay",
  label: "MOBILE // PAYMENTS",
  summary: "Two Flutter apps for Easy Pay Bills NG — one for customers, one for agents — shipped to iOS and Android.",
  details: [
    "Airtime, data, electricity bills and wallet management",
    "Dedicated agent features, on a REST API financial backend",
  ],
  tags: ["Flutter", "REST API", "Wallets"],
  status: "Shipped",
  categories: ["fintech", "mobile"],
};

const mamihubs: Project = {
  slug: "mamihubs",
  title: "Mamihubs",
  label: "COMMERCE",
  summary: "A multi-vendor e-commerce marketplace for Nigerian-made products, with payments and a vendor dashboard.",
  details: [],
  tags: ["Flutter", "API", "E-commerce"],
  categories: ["mobile"],
};

export const projects = {
  sectionLabel: "// 05.00 SEC_FLAGSHIP",
  index: "INDEX [05 / 09]",
  heading: "Flagship projects.",
  lede: "The products I've put the most into — designed, built and maintained.",
  featured: velcro,
  row: [abapower, geometric, easypay],
};

/* ──────────────────────────────── Systems Matrix ──────────────────────────────── */

export const systems = {
  sectionLabel: "// 06.00 SEC_SYSTEMS",
  index: "INDEX [06 / 09]",
  heading: "Systems matrix.",
  lede: "The full index — flagship products, client builds, work in development, experiments and research.",
  filters: [
    { id: "all", label: "All" },
    { id: "fintech", label: "Fintech" },
    { id: "mobile", label: "Mobile" },
    { id: "web", label: "Web" },
    { id: "experiments", label: "Experiments" },
  ] as const,
  /**
   * The matrix indexes every project, so each filter has entries.
   * Flagship projects are listed first and marked as such.
   */
  items: [
    { ...velcro, label: "FINTECH", summary: "WhatsApp-native banking, KYC and a BTC-to-NGN offramp. 1000+ active users." },
    { ...abapower, label: "ELECTRICITY" },
    { ...geometric, label: "WORKFORCE" },
    { ...easypay, label: "PAYMENTS" },
    {
      slug: "goxhr",
      title: "GoxHR",
      label: "HR",
      summary: "An employee self-service app for LuliFiber: attendance, clock-in/out, leave, requests and notifications.",
      details: [],
      tags: ["Flutter", "REST API"],
      categories: ["mobile"],
    },
    mamihubs,
    {
      slug: "shuga",
      title: "Shuga Entertainment",
      label: "EVENTS",
      summary: "An event platform with livestreaming and ticketing, shipped to Google Play and the App Store.",
      details: [],
      tags: ["Flutter", "Livestreaming", "Ticketing"],
      status: "Shipped",
      categories: ["mobile"],
    },
    {
      slug: "candleweb",
      title: "Candleweb",
      label: "WEB3",
      summary: "A Web3 crypto website with smart-contract payments, and a crypto mobile app built from Figma designs.",
      details: [],
      tags: ["Web3", "Solidity", "Flutter"],
      categories: ["fintech", "web"],
    },
    {
      slug: "corpsplug",
      title: "CorpsPlug",
      label: "PLATFORM",
      summary: "A platform for NYSC corps members: PPA reviews, state and LGA guides, reminders and community.",
      details: [],
      tags: ["Next.js", "Flutter"],
      status: "In development",
      categories: ["web", "mobile"],
    },
    {
      slug: "dayflow",
      title: "DayFlow",
      label: "MOBILE",
      summary: "A smart daily planner with charts and local persistence.",
      details: [],
      tags: ["Flutter", "sqflite", "fl_chart"],
      categories: ["mobile"],
    },
    {
      slug: "infinizoom",
      title: "infinizoom",
      label: "ENGINE",
      summary:
        "An infinite-zoom 3D visualization engine spanning 17+ orders of magnitude, with floating-origin math and an instanced renderer.",
      details: [],
      tags: ["Three.js", "Bun"],
      categories: ["experiments", "web"],
    },
    {
      slug: "e-voting",
      title: "E-Voting Architecture",
      label: "RESEARCH",
      summary:
        "A publicly verifiable e-voting design using blind signatures, ZK proofs, homomorphic encryption, Merkle trees and threshold cryptography.",
      details: [],
      tags: ["Cryptography", "Security"],
      categories: ["experiments"],
    },
    {
      slug: "chassis",
      title: "CHASSIS // Augmentation Console",
      label: "INTERFACE",
      summary: "A cyberpunk-themed interface with an SVG body figure, rarity tiers and CRT effects.",
      details: [],
      tags: ["HTML", "CSS", "JS", "SVG"],
      categories: ["web", "experiments"],
    },
  ] satisfies Project[],
  /** Slugs that also appear in Flagship Projects. */
  flagshipSlugs: ["velcro", "abapower", "geometric", "easypay"],
};

/* ──────────────────────────────── Certifications ──────────────────────────────── */

export const credentials = {
  sectionLabel: "// 07.00 SEC_CREDENTIALS",
  index: "INDEX [07 / 09]",
  heading: "Certifications.",
  lede: "Courses, programmes and community work — each one links to the original document.",
  items: [
    {
      title: "Flutter and Dart: Developing iOS, Android, and Mobile Apps",
      issuer: "IBM · Coursera",
      kind: "Course certificate",
      date: "Jul 31, 2026",
      id: "L4U2BKVFYGWH",
      image: "/certificates/ibm-flutter-dart-coursera.jpg",
      imageAlt: "IBM Coursera course certificate for Flutter and Dart, issued to Kelechi Bright Isaac",
      file: "/certificates/ibm-flutter-dart-coursera.pdf",
      verify: "https://coursera.org/verify/L4U2BKVFYGWH",
    },
    {
      title: "Futurize Founder Academy 2025",
      issuer: "Futurize",
      kind: "Certificate of completion",
      date: "Nov 17 – Dec 5, 2025",
      image: "/certificates/futurize-founder-academy-2025.jpg",
      imageAlt: "Futurize Founder Academy 2025 certificate of completion for Bright Kelechi Isaac, team BVD",
      file: "/certificates/futurize-founder-academy-2025.png",
      note: "Entrepreneurship and prototyping, as part of team BVD.",
    },
    {
      title: "DevFest Bauchi 2025 — Logistics Team",
      issuer: "GDG Bauchi",
      kind: "Certificate of appreciation",
      date: "2025",
      id: "DFB25-VOL-025",
      image: "/certificates/devfest-bauchi-2025.jpg",
      imageAlt: "DevFest Bauchi 2025 certificate of appreciation for Kelechi Isaac Bright",
      file: "/certificates/devfest-bauchi-2025.pdf",
      note: "Volunteer recognition for the event's logistics team.",
    },
  ] satisfies Credential[] as Credential[],
};

/* ──────────────────────────────── Company & services ──────────────────────────────── */

export const companySection = {
  sectionLabel: "// 08.00 SEC_COMPANY",
  index: "INDEX [08 / 09]",
  heading: "Isaac Kelechi Software Ltd.",
  lede: "My registered company. Hire me as an individual or contract the company — same engineer, same standards.",
  /** From the company's registered principal business activity. */
  services: [
    {
      n: "01",
      title: "Mobile apps",
      body: "Flutter apps for iOS and Android, from first screen to the store listing.",
    },
    {
      n: "02",
      title: "Websites & web apps",
      body: "Next.js, React and PHP platforms with the backend, database and admin they need.",
    },
    {
      n: "03",
      title: "Fintech & integrations",
      body: "Payments, WhatsApp Flows, third-party financial APIs and secure webhooks.",
    },
    {
      n: "04",
      title: "IT consulting",
      body: "Architecture reviews, technical planning and hands-on help shipping digital products.",
    },
  ],
};

/* ──────────────────────────────── Contact & footer ──────────────────────────────── */

export const contact = {
  sectionLabel: "// 09.00 SEC_CONTACT",
  index: "INDEX [09 / 09]",
  headline: ["Let's Build Something", "Extraordinary."],
  /** [PLACEHOLDER] adjust to your real availability. */
  availability: "Open to new projects and collaborations. I usually reply within a couple of days.",
  copyLabel: "Copy email",
  toast: "✓ Email copied",
  form: {
    title: "Contact us",
    lede: "Tell me about the project. The message goes straight to my inbox.",
    /**
     * Where form messages are delivered. Sending happens through EmailJS — the service,
     * template and public key come from NEXT_PUBLIC_EMAILJS_* env vars (see .env.example).
     * Without them, the form falls back to opening the visitor's email app.
     */
    recipient: "kcib.mail@gmail.com",
    projectTypes: [
      "Mobile app",
      "Website / web app",
      "Fintech / payments",
      "WhatsApp integration",
      "IT consulting",
      "Something else",
    ],
    submit: "Send message",
    sent: "✓ Message ready — check your email app",
    sentDirect: "✓ Message sent — I'll reply soon",
    failed: "Couldn't send. Please email me directly.",
  },
};

export const footer = {
  tagline: "// DESIGNED & ENGINEERED IN ABA, NG",
  replayLabel: "Replay build",
};
