// ── Whitelist de emails admin ─────────────────────────────────────────────
// Los emails autorizados a entrar a /admin se declaran en la variable de
// entorno NEXT_PUBLIC_ADMIN_EMAILS (CSV, sin espacios). El check se hace
// en el cliente al volver de Google Sign-In, y también se aplica en las
// reglas de Firestore para que la escritura solo funcione con esos emails.

const RAW = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '';

export const ADMIN_EMAILS: readonly string[] = RAW
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
