/**
 * Mirror of backend `@StrongPassword()` validator
 * (src/common/validators/strong-password.decorator.ts).
 *
 * Surfaces the same rules upfront so users see actionable Uzbek error
 * messages instead of a generic backend 400 when their password is too
 * weak. Keep in sync with the decorator — if the backend tightens the
 * rule (length, special char, etc.), update both sides in the same PR.
 *
 * Returns `null` when the password passes, otherwise the localized
 * error message to show in a toast.
 */
export function validateNewPassword(password: string): string | null {
  if (password.length < 8) {
    return "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
  }
  if (!/[0-9]/.test(password)) {
    return "Parolda kamida bitta raqam bo'lishi kerak";
  }
  if (!/[A-Z]/.test(password)) {
    return "Parolda kamida bitta katta harf bo'lishi kerak";
  }
  return null;
}
