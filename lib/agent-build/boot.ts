/**
 * Pre-paint boot logic for the agent build.
 *
 * This string is inlined in <head> so it runs before the first paint. On a first visit
 * per session it sets `html[data-ab="pending"]`, which (via globals.css) hides every
 * [data-layer] with opacity only — content stays in the DOM for crawlers and screen
 * readers, and the layout never shifts.
 *
 * It deliberately does nothing when:
 *   - the visitor prefers reduced motion,
 *   - the build already played this session,
 *   - the client is a crawler / audit tool (they always get the finished page),
 *   - storage is unavailable,
 *   - the URL has ?build=off (handy for audits or sharing a no-animation link).
 * `?build=on` forces the build even if it already played this session.
 *
 * Safety net: if the client bundle hasn't claimed the build within 6s (slow network,
 * JS error, blocked scripts), the attribute is removed and the finished page shows.
 */
export const SESSION_KEY = "kp:agent-build:v1";
export const BOOT_FLAG = "__abBoot";

export const BUILD_BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,q=location.search;
if(/[?&]build=off/.test(q))return;
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
if(/bot|crawl|spider|slurp|lighthouse|pagespeed|headlesschrome|prerender|preview/i.test(navigator.userAgent))return;
if(!/[?&]build=on/.test(q)&&sessionStorage.getItem('${SESSION_KEY}'))return;
d.setAttribute('data-ab','pending');
window.${BOOT_FLAG}={claimed:false};
setTimeout(function(){if(!window.${BOOT_FLAG}.claimed){d.removeAttribute('data-ab');}},6000);
}catch(e){}})();`;
