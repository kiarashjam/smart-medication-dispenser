/**
 * Marketing copy aligned with repository documentation:
 * - README.md (platform overview, limitations)
 * - software-docs/MVP_APPLICATION.md (in/out of scope)
 * - business-docs/MVP_BUSINESS_SUMMARY.md
 * - software-docs/WEBHOOKS_JSON_REFERENCE.md, 08_INTEGRATIONS_WEBHOOKS.md (webhooks, 60m miss)
 */

export const PRODUCT = {
  name: 'Smart Medication Dispenser',
  /** Two-line logo treatment in header */
  nameLine1: 'Smart Medication',
  nameLine2: 'Dispenser',
} as const;

export const FOOTER_TAGLINE =
  'MVP platform: logical dispensing devices, patient mobile app, caregiver web portal, and ASP.NET Core API with PostgreSQL.';

export const HERO_KICKER = 'MVP platform — schedule, dispense, confirm';

export const HERO_SUBTITLE =
  'Connect schedules to dose events and inventory: patients confirm intake on mobile, caregivers manage devices and history on the web, and the API can emit webhooks for missed doses (after a 60-minute window), low stock, and confirmations.';

export const FEATURES_INTRO =
  'What the monorepo ships today matches software-docs/MVP_APPLICATION.md: JWT auth, devices (main + portable for travel), containers, schedules, dispense lifecycle, notifications, travel sessions, and integrations (outgoing webhooks, device API keys, optional incoming webhook).';

export const LIMITATION_NOTE =
  'Known MVP limits (see root README): physical hardware is exercised via the device API—not a bundled firmware image; the web portal uses in-app notifications only; the mobile app uses Expo local notifications (not FCM/APNs); single-tenant; webhook delivery has no retry queue.';

export const DOC_LINKS = {
  mvpScope: 'software-docs/MVP_APPLICATION.md',
  webhooks: 'software-docs/WEBHOOKS_JSON_REFERENCE.md',
  readme: 'README.md',
} as const;
