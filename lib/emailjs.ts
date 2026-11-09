/**
 * EmailJS — sends the contact form straight to an inbox, no backend needed.
 *
 * Configure with three env vars (see .env.example). They are public by design:
 * EmailJS public keys are meant to ship to the browser. Lock the key down in the
 * EmailJS dashboard (Account → Security → allowed domains) instead.
 *
 * The SDK is imported lazily on submit, so it never weighs down the page.
 */

// NEXT_PUBLIC_* vars must be referenced literally so Next.js can inline them.
const config = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
};

/** True when all three values are present. Otherwise the form falls back to mailto. */
export const emailjsReady = Boolean(config.serviceId && config.templateId && config.publicKey);

/** Variables available in the EmailJS template as {{name}}. */
export interface ContactEmailParams {
  from_name: string;
  from_email: string;
  reply_to: string;
  project_type: string;
  message: string;
  to_email: string;
  page_url: string;
  sent_at: string;
}

export async function sendContactEmail(params: ContactEmailParams) {
  const { default: emailjs } = await import("@emailjs/browser");
  return emailjs.send(config.serviceId, config.templateId, { ...params }, {
    publicKey: config.publicKey,
    // At most one send per 10s from the same browser — basic spam protection.
    limitRate: { id: "kelechi-pro-contact", throttle: 10_000 },
  });
}
