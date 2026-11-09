# kelechi.pro

Personal portfolio of **Isaac Kelechi Bright**: a full-stack web and mobile engineer.
It's built with Next.js (App Router), TypeScript, Tailwind CSS v4 and GSAP.

On a visitor's first visit each session, a team of AI "agents" builds the page in front of them. They select each element, type the text, draw the borders, wipe in the images, duplicate the tags and count up the stats. When they finish, they gather into a swarm that follows the visitor's pointer.

---

## Quick start

Requires **Node.js 20.9+** (Node 22 LTS recommended).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command             | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Dev server with hot reload                                      |
| `npm run build`     | Runs `check` first, then the production build                   |
| `npm run start`     | Serve the production build locally                              |
| `npm run check`     | Typecheck + lint, which is the same gate `build` runs           |
| `npm run lint`      | ESLint, strict, fails on any warning                            |
| `npm run lint:fix`  | Auto-fix what ESLint can                                        |
| `npm run typecheck` | TypeScript check without emitting                               |

### Linting

`eslint.config.mjs` stacks Next.js core-web-vitals, typescript-eslint **strict-type-checked** and **stylistic-type-checked**, jsx-a11y **strict**, and extra correctness rules (exhaustive switches, no floating or misused promises, no non-null assertions, no index keys, consistent type imports, import cycles and more). `tsconfig.json` adds `noUncheckedIndexedAccess`, `noImplicitReturns`, `noImplicitOverride` and `noFallthroughCasesInSwitch` on top of `strict`.

Lint and typecheck run automatically before every `npm run build`, including on Vercel and Netlify, so a deploy with a lint or type error fails instead of shipping.

**Seeing the animation again:** the build plays once per browser session. To see it again, you can:

- click **Replay build** in the footer,
- open a new tab or private window, or
- add `?build=on` to the URL. Use `?build=off` to skip the animation, which is handy for audits or for sending someone a link.

---

## Editing content

All personal content is in **[`data/content.ts`](data/content.ts)**: bio, projects, stats, links, copy and the **accent colour**. Components never hard-code personal content.

- `site.accent` is the single accent colour. It drives the CSS, the build animation, the favicon and the social card. Set it to `"#6e57e0"` for purple.
- Wrap text in `**double asterisks**` to make it bold.
- `profile.portrait` is `public/portrait.png`, a 4:5 transparent cutout. To swap it, replace the file and keep the 4:5 ratio.
- `profile.resume` points at `public/Isaac-Kelechi-Bright-Resume.pdf`. To update your CV, replace that PDF, and `public/resume-preview.jpg` if you want the preview to match.
- `experience`, `skills`, `credentials` and `company` hold the resume, skills, certificates and CAC data. Certificate files and thumbnails live in `public/certificates/` and `public/company/`.
- **Contact form (EmailJS):** copy `.env.example` to `.env.local` and fill in the three `NEXT_PUBLIC_EMAILJS_*` values. Add the same three variables under your Vercel or Netlify project's environment settings, then redeploy. Until they're set, the form opens the visitor's email app instead. Messages go to `contact.form.recipient`.
- Stats with `value: null` render as "—" until you add a number.
- Socials with an empty `href` render as a disabled "link pending" tile.

Search the file for `[PLACEHOLDER]`. The full list is in [PLACEHOLDERS.md](PLACEHOLDERS.md).

---

## Project structure

```
app/
  layout.tsx            fonts, metadata (OG/Twitter), JSON-LD, pre-paint boot script
  page.tsx              section composition
  globals.css           design tokens + Tailwind v4 theme
  sitemap.ts robots.ts manifest.ts
  icon.tsx apple-icon.tsx opengraph-image.tsx twitter-image.tsx   (generated at build)
components/             Navbar, Hero, About, Skills, Experience, Projects, SystemsMatrix,
                        Certifications, Company, Contact (with form), Footer, …
public/                 portrait, resume PDF, certificates, CAC certificate
data/content.ts         ← all editable content
lib/agent-build/        the "agents build the page" module
  boot.ts               inline <head> script: decides whether to hide layers before paint
  layers.ts             layer collection + measurement in reading order
  controller.ts         phases, scheduling, Touring auto-scroll, speed, skip/replay
  agents.ts             agent cursors + curved, eased motion
  overlay.ts            selection boxes, carets, border draws, duplicate ghosts
  reveal.ts             per-type reveal effects (text / card / image / tags / stat / …)
  hud.ts                bottom control bar
  swarm.ts              finished-state swarm: agents orbit the pointer in counter-rotating rings
  sound.ts              Web Audio ticks, pops and chime (opt-in, no audio files)
  clock.ts              speed-scaled GSAP tweens and waits
  styles.css            overlay + HUD styles
```

### How the build animation works

1. **Before first paint**, `boot.ts` sets `html[data-ab]` when this is the first visit of the session. This only happens when the visitor doesn't prefer reduced motion and isn't a crawler, and the URL doesn't say `?build=off`. CSS then sets every `[data-layer]` element to `opacity: 0`. The content stays in the HTML for search engines and screen readers, and the layout never shifts.
2. **Scan.** Crosshairs drift around while fonts load and `layers.ts` measures every layer once.
3. **Build.** The controller hands layers to free agents in reading order. A child layer starts only after its parent card is finished. Each agent glides along a curved path, draws a selection box and runs the reveal that matches the layer's type. Touring auto-scrolls the page to follow the build, and any manual scroll turns Touring off.
4. **Done.** The HUD shows the agent count and build time. The agents form two counter-rotating rings around the pointer, with every cursor pointing at the centre.

It animates only `transform`, `opacity` and `clip-path`, all in a single `gsap.ticker` loop with no layout reads inside it. Overlays are `pointer-events: none`. **✕** and **Esc** always jump to the finished page. If the JavaScript fails to load within 6 seconds, the boot script un-hides the page by itself.

**Making new elements part of the build:** add `data-layer="text|card|button|image|tags|stat|block|line|fade"` to an element. Inside a `tags` row, mark each pill with `data-tag`. Inside a `stat`, mark the number with `data-count={n}`.

---

## Deploy

### Vercel (recommended)

1. Push this folder to a GitHub, GitLab or Bitbucket repository.
2. Go to <https://vercel.com/new>, import the repository and click **Deploy**. Vercel detects Next.js automatically, so there's nothing to configure.

You can also deploy from the CLI with `npx vercel` and then `npx vercel --prod`.

### Netlify

1. Push to a Git repository.
2. Go to <https://app.netlify.com/start> and import the repository. Netlify detects Next.js automatically. The included `netlify.toml` pins `npm run build`, the `.next` publish directory and Node 22.
3. Click **Deploy**.

You can also deploy from the CLI with `npx netlify-cli deploy --build` and then `npx netlify-cli deploy --build --prod`.

---

## Pointing kelechi.pro to the site

Do this at your domain registrar or DNS provider.

### On Vercel

1. Open the project, go to **Settings → Domains** and add both `kelechi.pro` and `www.kelechi.pro`.
2. Add these DNS records:

   | Type  | Name  | Value                  |
   | ----- | ----- | ---------------------- |
   | A     | `@`   | `76.76.21.21`          |
   | CNAME | `www` | `cname.vercel-dns.com` |

   Vercel sometimes shows a project-specific value instead. If it does, use that one.
3. Set `kelechi.pro` as the primary domain so `www` redirects to it. HTTPS is issued automatically.

You can also switch the domain's nameservers to Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`) instead of adding records.

### On Netlify

1. Open the site, go to **Domain management → Add a domain** and enter `kelechi.pro`.
2. Either use **Netlify DNS**, by pointing your registrar's nameservers to the four `dnsN.p0X.nsone.net` servers Netlify shows you, or add these records at your current DNS provider:

   | Type  | Name  | Value                            |
   | ----- | ----- | -------------------------------- |
   | A     | `@`   | `75.2.60.5`                      |
   | CNAME | `www` | `<your-site-name>.netlify.app`   |

3. HTTPS (Let's Encrypt) is provisioned automatically once DNS resolves.

DNS changes usually take effect within minutes, but can take up to 48 hours.

---

## Performance notes

Lighthouse results for the finished page (`/?build=off`), from a local production build:

| Profile | Performance | Accessibility | Best practices | SEO |
| ------- | ----------- | ------------- | -------------- | --- |
| Mobile  | 95          | 100           | 100            | 100 |
| Desktop | 100         | 100           | 100            | 100 |

**Trade-off to know about:** on a visitor's *first* visit, page content is hidden until the agents reveal it. That's what the design asks for. Lighthouse simulates a first-time visitor, so on `/` with the animation on it can't find a Largest Contentful Paint and reports no performance score. Real first-time visitors also see the hero text arrive a few seconds later than they would without the build. Repeat visits in the same session, reduced-motion users, crawlers and `?build=off` all get the finished page right away. If first-visit Core Web Vitals matter more to you than the full effect, make the hero `h1` and intro paragraph visible from the start by removing their `data-layer` attributes in `components/Hero.tsx`.
# kelechipro
