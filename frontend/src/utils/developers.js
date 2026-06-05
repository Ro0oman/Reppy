// Hardcoded developer accounts — badge shown next to their name everywhere.
export const DEVELOPER_EMAILS = new Set(['romainot99@gmail.com']);

export function isDeveloperEmail(email) {
  return !!email && DEVELOPER_EMAILS.has(email);
}
