# Placeholders and things to confirm

Everything below is in [`data/content.ts`](data/content.ts) unless noted otherwise.

## Still to fill in

| # | What | Where | Current value |
|---|------|-------|---------------|
| 1 | **Bio** (two paragraphs) | `about.bio` | Draft built from your resume profile. Rewrite it in your own voice |
| 2 | **Quote** | `about.quote` | Draft line. Replace it with one you stand behind |
| 3 | **Principles** (3 cards) | `about.principles` | Drafts. Edit or keep |
| 4 | **Availability line** | `contact.availability` | "…reply within a couple of days". Adjust to your real response time |
| 5 | **Education end year / degree** (optional) | `experience.education.period` | "Sep 2017", as on the resume |
| 6 | **Project links** (optional): store listings, live URLs, repos | Add `link: { href, label }` to any project | none set |
| 7 | **EmailJS keys on your host** | Add the three `NEXT_PUBLIC_EMAILJS_*` vars from `.env.local` to Vercel/Netlify | set locally in `.env.local`; production needs them too |

## Confirm

| What | Note |
|------|------|
| **Email** | The site and the contact form use `kcib.mail@gmail.com`. The resume PDF lists `kcib.dev@gmail.com` |
| **LinkedIn** | `linkedin.com/in/kcib`, taken from the resume |
| **Resume PDF** (`public/Isaac-Kelechi-Bright-Resume.pdf`) | Publicly downloadable, and it includes your phone number. The updated version still has "Abubakar Tafewa Belewa" (should be Tafawa Balewa) and "Mr, Isaac Kelechi"; the site copy uses the correct spellings. Re-export it from FlowCV and replace the file to fix them |
| **CAC verify link** | Points to `https://search.cac.gov.ng`, CAC's public search |

## Deliberately not published

- **CAC Application for Registration / status report.** It contains your residential address, date of birth, phone number and personal email. Only the Certificate of Incorporation (name, RC number, date) is on the site.
