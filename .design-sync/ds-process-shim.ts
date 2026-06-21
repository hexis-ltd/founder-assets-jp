// Browser shim for design-sync previews.
//
// The synced components pull in Next.js client internals (next/link,
// next/navigation) that read process.env.* at module-eval and render time.
// The preview bundle runs in a browser with no Node process, so any
// process.env.* access other than NODE_ENV (which the converter defines at
// build time) throws "process is not defined". Provide an inert process before
// anything reads it. This module is listed FIRST in cfg.extraEntries so it is
// evaluated before the Next modules in the bundle.
const g = globalThis as unknown as { process?: { env?: Record<string, string> } };
if (typeof g.process === "undefined") {
  g.process = { env: { NODE_ENV: "production" } };
} else if (!g.process.env) {
  g.process.env = { NODE_ENV: "production" };
}
export {};
