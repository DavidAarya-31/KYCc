import * as Sentry from '@sentry/react';

export function initSentry() {
  if (!import.meta.env.PROD) return;
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Strip PII
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

export { Sentry };
