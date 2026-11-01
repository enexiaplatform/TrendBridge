/** Owner allowlist is a server-only configuration value, never a user-supplied field.
 * The email form requires an email verified by Supabase Auth, not user_metadata.
 */
const uuid = /^[a-f\d]{8}-[a-f\d]{4}-[1-8][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function matchesPilotOwner(ownerId: string, verifiedEmail: string | null | undefined, configured: string | null | undefined) {
  const allow = configured?.trim().toLowerCase();
  if (!allow) return false;
  if (uuid.test(allow)) return ownerId.toLowerCase() === allow;
  if (!email.test(allow)) return false;
  return Boolean(verifiedEmail && verifiedEmail.toLowerCase() === allow);
}
