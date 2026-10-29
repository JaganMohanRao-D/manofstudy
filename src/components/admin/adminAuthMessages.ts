/**
 * Pure helpers for the owner-portal sign-in UI: input validation and
 * user-facing messages. Kept free of Firebase/React imports so they can be
 * unit-tested directly.
 *
 * Messages deliberately never echo raw Firebase/backend errors, emails, tokens
 * or internal codes, and never reveal whether an email has an account.
 */

export const RESET_NEUTRAL_MESSAGE =
  "If an account exists for that email address, a password reset link has been sent. Check your inbox and spam folder.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 1024;

/** Hosts for which Firebase's authorized-domain list is documented to include the site. */
const RESET_RETURN_HOSTS = new Set(["naacollege.in", "www.naacollege.in"]);

export function isPlausibleEmail(value: string): boolean {
  const email = value.trim();
  return email.length > 0 && email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

export function validateLoginInput(email: string, password: string): string | null {
  if (!isPlausibleEmail(email)) return "Enter a valid email address.";
  if (!password) return "Enter your password.";
  if (password.length > MAX_PASSWORD_LENGTH) return "Enter your password.";
  return null;
}

export function validateResetInput(email: string): string | null {
  return isPlausibleEmail(email) ? null : "Enter a valid email address.";
}

/**
 * Where the Firebase password-reset page should send the owner afterwards.
 * Returns null on non-production hosts (e.g. *.pages.dev previews) because
 * Firebase rejects continue URLs for domains that are not authorized.
 */
export function resetContinueUrl(location: { protocol: string; hostname: string }): string | null {
  if (location.protocol !== "https:" || !RESET_RETURN_HOSTS.has(location.hostname)) return null;
  return `https://${location.hostname}/theone`;
}

export function errorCode(error: unknown): string {
  if (!error || typeof error !== "object" || !("code" in error)) return "";
  const raw = String((error as { code?: unknown }).code || "").toLowerCase();
  return raw.startsWith("functions/") ? raw.slice("functions/".length) : raw;
}

function errorReason(error: unknown): string {
  if (!error || typeof error !== "object" || !("details" in error)) return "";+  const details = (error as { details?: unknown }).details;
  if (!details || typeof details !== "object" || !("reason" in details)) return "";
  return String((details as { reason?: unknown }).reason || "");
}

export function loginErrorMessage(error: unknown): string {
  const code = errorCode(error);

  // Firebase Authentication (email/password step). Unknown email and wrong
  // password intentionally share one message.
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-login-credentials" ||
    code === "auth/invalid-email" ||
    code === "auth/missing-password"
  ) {
    return "Incorrect email or password.";
  }
  if (code === "auth/user-disabled") {
    return "This account has been disabled.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a few minutes, or reset your password.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Check your connection and try again.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Email sign-in is not enabled yet. Please contact the site owner.";
  }

  // Backend authorization step (Cloud Functions).
  if (code === "permission-denied") {
    if (errorReason(error) === "email-not-verified") {
      return "Your email address has not been verified yet. Use “Forgot password?” to verify it and set your password, then sign in.";
    }
    return "This account is not authorized to access the admin area.";
  }
  if (code === "unauthenticated") {
    return "Your sign-in could not be confirmed. Please try again.";
  }
  if (code === "resource-exhausted") {
    return "Too many sign-in attempts. Please wait 15 minutes and try again.";
  }
  if (code === "not-found" || code === "unavailable" || code === "deadline-exceeded") {
    return "The sign-in service is temporarily unavailable. Please try again later.";
  }
  if (code === "internal" || code === "unknown" || code === "failed-precondition") {
    return "Sign-in could not be completed. Please try again later.";
  }

  return "Sign-in failed. Please try again.";
}

/**
 * Message for a failed password-reset request, or null when the failure must be
 * presented as the same neutral confirmation (so account existence is never
 * revealed).
 */
export function resetErrorMessage(error: unknown): string | null {
  const code = errorCode(error);
  if (code === "auth/user-not-found") return null;
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/too-many-requests") {
    return "Too many requests. Please wait a few minutes and try again.";
  }
  if (code === "auth/network-request-failed") {
    return "Network error. Check your connection and try again.";
  }
  return "Password reset is unavailable right now. Please try again later.";
}
