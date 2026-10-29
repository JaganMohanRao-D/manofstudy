// Run with: npx tsx --test src/components/admin/adminAuthMessages.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import {
  RESET_NEUTRAL_MESSAGE,
  errorCode,
  isPlausibleEmail,
  loginErrorMessage,
  resetContinueUrl,
  resetErrorMessage,
  validateLoginInput,
  validateResetInput,
} from "./adminAuthMessages";

const fbError = (code: string, details?: unknown) => ({ code, message: "RAW INTERNAL TEXT jaganmakes@gmail.com token=abc", details });

test("login input validation", () => {
  assert.equal(validateLoginInput("owner@example.com", "pw"), null);
  assert.equal(validateLoginInput("  owner@example.com  ", "pw"), null);
  assert.equal(validateLoginInput("", "pw"), "Enter a valid email address.");
  assert.equal(validateLoginInput("not-an-email", "pw"), "Enter a valid email address.");
  assert.equal(validateLoginInput("a@b", "pw"), "Enter a valid email address.");
  assert.equal(validateLoginInput("owner@example.com", ""), "Enter your password.");
  assert.equal(isPlausibleEmail("x".repeat(250) + "@a.co"), false);
});

test("reset input validation", () => {
  assert.equal(validateResetInput("owner@example.com"), null);
  assert.equal(validateResetInput("nope"), "Enter a valid email address.");
});

test("incorrect credentials: unknown email and wrong password are indistinguishable", () => {
  const messages = new Set(
    ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-login-credentials"].map((c) =>
      loginErrorMessage(fbError(c))
    )
  );
  assert.equal(messages.size, 1);
  assert.equal([...messages][0], "Incorrect email or password.");
});

test("login error messages for disabled, throttled, network and backend states", () => {
  assert.equal(loginErrorMessage(fbError("auth/user-disabled")), "This account has been disabled.");
  assert.match(loginErrorMessage(fbError("auth/too-many-requests")), /Too many attempts/);
  assert.match(loginErrorMessage(fbError("auth/network-request-failed")), /Network error/);
  assert.match(loginErrorMessage(fbError("functions/resource-exhausted")), /15 minutes/);
  assert.match(loginErrorMessage(fbError("functions/permission-denied")), /not authorized/);
  assert.match(loginErrorMessage(fbError("functions/unavailable")), /temporarily unavailable/);
  assert.match(loginErrorMessage(fbError("functions/not-found")), /temporarily unavailable/);
  assert.match(loginErrorMessage(fbError("functions/internal")), /could not be completed/);
});

test("unverified owner email gets actionable guidance only via the backend reason", () => {
  const unverified = loginErrorMessage(fbError("functions/permission-denied", { reason: "email-not-verified" }));
  assert.match(unverified, /not been verified/);
  assert.match(unverified, /Forgot password/);
  assert.doesNotMatch(loginErrorMessage(fbError("functions/permission-denied")), /verified/);
});

test("messages never echo raw errors, emails, tokens or internal codes", () => {
  const codes = [
    "auth/invalid-credential", "auth/user-disabled", "auth/too-many-requests", "auth/network-request-failed",
    "functions/permission-denied", "functions/internal", "functions/unknown", "weird/unmapped", "",
  ];
  for (const code of codes) {
    for (const message of [loginErrorMessage(fbError(code)), resetErrorMessage(fbError(code)) ?? ""]) {
      assert.doesNotMatch(message, /RAW INTERNAL|jaganmakes|token|abc|auth\/|functions\//i);
    }
  }
  assert.equal(loginErrorMessage(undefined), "Sign-in failed. Please try again.");
  assert.equal(loginErrorMessage("boom"), "Sign-in failed. Please try again.");
  assert.equal(loginErrorMessage(new Error("boom")), "Sign-in failed. Please try again.");
});

test("password reset does not disclose whether an account exists", () => {
  // The only existence-dependent Firebase outcome is swallowed into the neutral confirmation.
  assert.equal(resetErrorMessage(fbError("auth/user-not-found")), null);
  assert.match(RESET_NEUTRAL_MESSAGE, /^If an account exists/);
  // Other outcomes do not depend on whether the account exists.
  assert.match(resetErrorMessage(fbError("auth/too-many-requests")) ?? "", /Too many requests/);
  assert.match(resetErrorMessage(fbError("auth/network-request-failed")) ?? "", /Network error/);
  assert.match(resetErrorMessage(fbError("auth/unauthorized-continue-uri")) ?? "", /unavailable/);
});

test("reset return URL is only used on the production hosts, over https", () => {
  assert.equal(resetContinueUrl({ protocol: "https:", hostname: "naacollege.in" }), "https://naacollege.in/theone");
  assert.equal(resetContinueUrl({ protocol: "https:", hostname: "www.naacollege.in" }), "https://www.naacollege.in/theone");
  assert.equal(resetContinueUrl({ protocol: "https:", hostname: "preview.pages.dev" }), null);
  assert.equal(resetContinueUrl({ protocol: "http:", hostname: "naacollege.in" }), null);
  assert.equal(resetContinueUrl({ protocol: "https:", hostname: "naacollege.in.evil.com" }), null);
});

test("errorCode strips the functions/ prefix and tolerates junk", () => {
  assert.equal(errorCode({ code: "functions/Permission-Denied" }), "permission-denied");
  assert.equal(errorCode({ code: "auth/user-disabled" }), "auth/user-disabled");
  assert.equal(errorCode(null), "");
  assert.equal(errorCode({}), "");
});
