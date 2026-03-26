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

export const HERO_KICKER = 'For care teams and families — clarity when medication matters most';

/** Hero: business outcomes first; who it helps and why it exists. */
export const HERO_SUBTITLE_PRIMARY =
  'Missed or unclear medication routines create stress for patients and everyone supporting them. This platform gives patients a simple way to confirm each dose from their phone, while families and professional caregivers see schedules, history, and device status in one place—so fewer gaps, less guesswork, and a shared picture of what actually happened.';

export const HERO_SUBTITLE_SECONDARY =
  'Whether you support someone at home or across a care organization, you get timely visibility when doses are due, taken, or missed, plus gentle ways to catch low supply before it becomes an emergency. It is built to reduce phone tag and manual logs, and to scale from a single household to a team that needs the same trusted record.';

/**
 * @deprecated Use `HERO_SUBTITLE_PRIMARY` and `HERO_SUBTITLE_SECONDARY` in the hero (two paragraphs).
 * Re-exported so older imports / HMR caches that still expect `HERO_SUBTITLE` do not break.
 */
export const HERO_SUBTITLE = `${HERO_SUBTITLE_PRIMARY} ${HERO_SUBTITLE_SECONDARY}`;

/** Under CTAs: benefits in plain language (no implementation detail). */
export const HERO_HIGHLIGHTS = [
  {
    title: 'Time to act on missed doses',
    detail:
      'If a scheduled dose is not confirmed, the platform surfaces that clearly so caregivers can follow up—before small slips turn into bigger risks.',
  },
  {
    title: 'Confidence when life moves',
    detail:
      'Travel and routine changes are handled with a dedicated flow so dosing can stay on track away from home, then settle back when the person returns.',
  },
  {
    title: 'Fits the way you already work',
    detail:
      'Connect alerts and events into the tools your organization already uses, so operations and care teams stay aligned without maintaining a separate paper trail.',
  },
] as const;

export const FEATURES_INTRO =
  'Today’s product covers the full loop care teams expect: home and portable devices, organized medication slots, schedules that drive reminders, a clear history of what was due and what was taken, travel support for time away, and optional connections for alerts and automation—so operations stay in sync with real life on the ground.';

export const LIMITATION_NOTE =
  'Known MVP limits (see root README): physical hardware is exercised via the device API—not a bundled firmware image; the web portal uses in-app notifications only; the mobile app uses Expo local notifications (not FCM/APNs); single-tenant; webhook delivery has no retry queue.';

export const DOC_LINKS = {
  mvpScope: 'software-docs/MVP_APPLICATION.md',
  webhooks: 'software-docs/WEBHOOKS_JSON_REFERENCE.md',
  readme: 'README.md',
} as const;
