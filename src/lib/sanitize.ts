/**
 * Defensive Security Utilities: Input Sanitization against XSS, SQLi & Injection attacks
 */

/**
 * Strips HTML tags, script protocols, event handlers and dangerous characters.
 */
export function sanitizeString(input: unknown, maxLength: number = 2000): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input).slice(0, maxLength);
  }

  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript\s*:/gi, '') // Strip javascript: protocol
    .replace(/vbscript\s*:/gi, '') // Strip vbscript: protocol
    .replace(/data\s*:\s*text\/html/gi, '') // Strip data: HTML
    .replace(/on\w+\s*=/gi, '') // Strip inline event handlers (e.g. onload=, onerror=)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Strip control characters
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and normalizes email addresses
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  const clean = email.toLowerCase().trim().slice(0, 255);
  // Basic RFC 5322 regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(clean) ? clean : '';
}

/**
 * Normalizes phone numbers allowing standard international prefixes (+, digits, spaces, hyphens)
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== 'string') return '';
  return phone.replace(/[^0-9+\s\-()]/g, '').trim().slice(0, 30);
}

/**
 * Sanitizes numeric amount or returns fallback
 */
export function sanitizeNumber(value: unknown, min: number = 0, max: number = 100_000_000): number {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return min;
  return Math.min(Math.max(num, min), max);
}

/**
 * Validates UUID format for database queries to prevent injection in where clauses
 */
export function isValidUUID(uuid: unknown): boolean {
  if (typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
}
