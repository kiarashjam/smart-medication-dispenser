/** Normalize API / JWT role strings for UI routing. */

export function isCaregiverRole(role: string | undefined | null): boolean {
  return (role ?? '').toLowerCase() === 'caregiver';
}

export function isPatientRole(role: string | undefined | null): boolean {
  return (role ?? '').toLowerCase() === 'patient';
}

export function isAdminRole(role: string | undefined | null): boolean {
  return (role ?? '').toLowerCase() === 'admin';
}
