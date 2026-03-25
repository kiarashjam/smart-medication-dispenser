/** Authenticated caregiver portal base path (all in-app routes live under this). */
export const APP_BASE = '/app';

export function appPath(subPath = ''): string {
  if (!subPath || subPath === '/') return APP_BASE;
  const clean = subPath.startsWith('/') ? subPath : `/${subPath}`;
  return `${APP_BASE}${clean}`;
}
