"use client";

import { useEffect, useId, useRef, useState, type SyntheticEvent } from "react";
import { contact, profile } from "@/data/content";
import { emailjsReady, sendContactEmail } from "@/lib/emailjs";
import { ArrowIcon, SectionHeader } from "./primitives";

/** Copy to the clipboard. The async Clipboard API works in every current browser over HTTPS. */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const field =
  "w-full rounded-[3px] border border-line-2 bg-[#0b0b0c] px-4 py-3 text-[15px] text-fg placeholder:text-fg-3 transition-colors focus:border-accent focus:outline-none";
const labelCls = "mono-label mb-2 block text-[10px]";

/**
 * Contact form. Sends through EmailJS to `contact.form.recipient` when the
 * NEXT_PUBLIC_EMAILJS_* env vars are set; otherwise opens the visitor's email app
 * with the message pre-filled.
 */
function ContactForm({ notify }: { notify: (msg: string) => void }) {
  const f = contact.form;
  const id = useId();
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const value = (key: string) => {
      const v = fd.get(key);
      return typeof v === "string" ? v.trim() : "";
    };
    const data = {
      name: value("name"),
      email: value("email"),
      type: value("type"),
      message: value("message"),
    };
    if (value("website")) return; // honeypot — bots fill hidden fields

    if (emailjsReady) {
      setSending(true);
      try {
        await sendContactEmail({
          from_name: data.name,
          from_email: data.email,
          reply_to: data.email,
          project_type: data.type,
          message: data.message,
          to_email: f.recipient,
          page_url: window.location.href,
          sent_at: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
        });
        form.reset();
        notify(f.sentDirect);
      } catch (err) {
        // EmailJS rejects with { status, text }; 429 means the rate limit kicked in.
        const status = typeof err === "object" && err !== null && "status" in err ? err.status : undefined;
        notify(status === 429 ? "Please wait a few seconds before sending again." : f.failed);
      } finally {
        setSending(false);
      }
      return;
    }

    const subject = `${data.type || "Project enquiry"} — ${data.name}`;
    const body = `${data.message}\n\n— ${data.name}\n${data.email}`;
    window.location.href = `mailto:${f.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    notify(f.sent);
  };

  return (
    <form data-layer="card" onSubmit={(e) => void onSubmit(e)} className="panel relative overflow-hidden p-6 md:p-8" aria-labelledby={`${id}-title`}>
      <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-full bg-accent" />
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h3 id={`${id}-title`} data-layer="text" className="mb-1.5 text-[24px] font-extrabold tracking-[-0.025em]">
            {f.title}
          </h3>
          <p data-layer="text" className="text-[14px] text-fg-2">
            {f.lede}
          </p>
        </div>
        <span className="mono-label hidden text-[10px] text-accent-ink sm:block">FORM_01</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={labelCls}>
            Name
          </label>
          {/* suppressHydrationWarning: autofill / temp-mail extensions inject attributes into these fields. */}
          <input
            id={`${id}-name`}
            name="name"
            required
            autoComplete="name"
            className={field}
            placeholder="Your name"
            suppressHydrationWarning
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={labelCls}>
            Email
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
            placeholder="you@company.com"
            suppressHydrationWarning
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-type`} className={labelCls}>
            Project type
          </label>
          <select id={`${id}-type`} name="type" className={`${field} appearance-none`} defaultValue={f.projectTypes[0]}>
            {f.projectTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className={labelCls}>
            Message
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            required
            rows={5}
            minLength={10}
            className={`${field} resize-y`}
            placeholder="What are you building, and when do you need it?"
          />
        </div>
        {/* Honeypot: hidden from people, tempting for bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label>
            Website <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-[10px] tracking-[0.08em] text-fg-3">
          {emailjsReady ? "Sent securely to my inbox." : `Opens your email app, addressed to ${f.recipient}.`}
        </p>
        <button type="submit" disabled={sending} className="btn btn-primary disabled:opacity-60">
          {sending ? "Sending…" : f.submit}
          <ArrowIcon />
        </button>
      </div>
    </form>
  );
}

export default function Contact() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const notify = (msg: string) => {
    setToast(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const onCopy = async () => {
    if (await copyText(profile.email)) notify(contact.toast);
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-24 md:py-36">
      <div
        data-layer="fade"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[-30%] -z-10 mx-auto h-[620px] max-w-[1100px] bg-[radial-gradient(ellipse_at_50%_60%,color-mix(in_oklab,var(--accent)_12%,transparent),transparent_65%)]"
      />
      <div className="mx-auto max-w-[1240px] px-5 md:px-8">
        <SectionHeader
          id="contact-title"
          label={contact.sectionLabel}
          index={contact.index}
          title={
            <>
              {contact.headline[0]} <span className="text-accent">{contact.headline[1]}</span>
            </>
          }
        />

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p data-layer="text" className="mb-8 max-w-[480px] text-[17px] leading-relaxed text-fg-2">
              <span className="mr-2 inline-block align-middle">
                <span className="status-dot" aria-hidden="true" />
              </span>
              {contact.availability}
            </p>

            <div data-layer="card" className="panel mb-6 p-5">
              <p className="mono-label mb-2 text-[10px]">MAIL // DIRECT LINE</p>
              <a
                data-layer="text"
                href={`mailto:${profile.email}`}
                className="mb-4 block truncate font-mono text-[clamp(1rem,2vw,1.3rem)] font-medium text-fg hover:text-accent-ink"
              >
                {profile.email}
              </a>
              <div className="flex gap-2">
                <button data-layer="button" type="button" onClick={() => void onCopy()} className="btn btn-primary h-11 flex-1 text-[11px]">
                  {contact.copyLabel}
                </button>
                <a
                  data-layer="button"
                  href={profile.resume.href}
                  download={profile.resume.fileName}
                  className="btn btn-ghost h-11 flex-1 text-[11px]"
                >
                  {profile.resume.label}
                </a>
              </div>
            </div>

            <p data-layer="text" className="mono-label mb-3">
              ELSEWHERE
            </p>
            <ul className="grid grid-cols-3 gap-2">
              {profile.socials.map((s) =>
                s.href ? (
                  <li key={s.label} data-layer="card" className="panel panel-hover">
                    <a href={s.href} target="_blank" rel="noopener noreferrer me" className="flex flex-col gap-3 px-4 py-3.5">
                      <span className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold">{s.label}</span>
                        <ArrowIcon className="text-fg-3" />
                      </span>
                      <span className="truncate font-mono text-[10px] text-fg-3">{s.handle}</span>
                    </a>
                  </li>
                ) : (
                  // Not set yet — fill the href in data/content.ts.
                  <li key={s.label} data-layer="card" className="panel px-4 py-3.5">
                    <span className="block text-[14px] font-semibold text-fg-2">{s.label}</span>
                    <span className="block font-mono text-[10px] text-fg-3">link pending</span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <ContactForm notify={notify} />
          </div>
        </div>
      </div>

      <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-24 left-1/2 z-[80] -translate-x-1/2">
        {toast ? (
          <div className="animate-[toast-in_0.25s_ease-out] rounded-full border border-accent/50 bg-[#0d0d0e] px-5 py-2.5 font-mono text-[12px] tracking-[0.1em] whitespace-nowrap text-fg shadow-[0_10px_40px_-10px_var(--accent)]">
            {toast}
          </div>
        ) : null}
      </div>
    </section>
  );
}
