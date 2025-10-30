import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.0,
  integrations: [],
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});


