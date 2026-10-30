# Naa College private admin — email/password owner authentication

The private owner route is `https://naacollege.in/theone`. The owner signs in with an email address and password. The only permitted admin identity is allowlisted inside Firebase Cloud Functions; the frontend never renders the owner email and contains no password.

This document separates three things: **A. source-code changes** (in this repository), **B. Firebase Console setup** (manual, in project `manofstudy-live`), and **C. production deployment** (manual, needs Firebase and Cloudflare access). Nothing here has been deployed or changed in production by the code change itself.

## A. Source-code changes

| File | Change |
| --- | --- |
| `functions/adminAuthCore.js` | Owner allowlist, live-account validation, rate limiting, hashed server-side sessions and session verification. |
| `functions/adminCmsCore.js` (new) | Owner-session-verified CMS workspace, drafts, publish/unpublish, revisions, recycle bin, audit records and media registry. |
| `functions/index.js` | Keeps existing Functions and adds CMS callable wrappers; includes the `onDocumentDeleted` import fix. |
| `functions/adminAuthCore.test.js` | Owner authentication/session unit tests. |
| `functions/adminCmsCore.test.js` (new) | CMS authorization, publishing, unpublishing, revision/trash and sanitization tests. |
| `src/services/adminFirebase.ts` (new) | Isolated Firebase app + in-memory Auth + Functions client used only by the admin portal. |
| `src/components/admin/AdminPortal.tsx` | Google button/handler removed; email + password form, show/hide password, forgot-password flow, loading and error states. Branding/layout unchanged. |
| `src/components/admin/adminAuthMessages.ts` (new) | Pure validation and user-facing error/neutral messages. |
| `src/components/admin/adminAuthMessages.test.ts` (new) | 9 frontend logic tests. |
| `docs/naacollege-admin-auth-setup.md` | This file. |

Not changed: `src/main.tsx` (the `/theone` route and its isolation from the public app), `src/services/firebase.ts`, `AuthContext`, `GoogleAuthModal`, public Google sign-in, `firestore.rules`, `firebase.json`, Firebase project configuration.

### Why the Google dependency existed, and a second problem found

* **Google dependency:** `assertOwnerGoogleIdentity()` in the backend required `sign_in_provider === "google.com"`, and `AdminPortal.tsx` called `signInWithPopup(auth, googleProvider)`. Both are replaced.
* **Pre-existing bug (important):** `functions/index.js` called `onDocumentDeleted` without importing it, so the module threw `ReferenceError: onDocumentDeleted is not defined` as soon as it was loaded. A codebase that cannot load cannot deploy or serve **any** of its functions, including the three admin callables. This is now imported. Whether an older, working build is currently deployed in production could not be verified from the repository.
* **Noticed, not changed (out of scope):** in `processCampusCommunityReport`, `authSnap.exists()` is called as a method; in the Admin SDK `exists` is a property, so that line would throw `TypeError` when a reported author's profile is read. Worth a separate fix.

## Authentication flow

1. The owner enters email and password. The browser validates the format only.
2. Firebase Authentication (Email/Password provider) verifies the password. This happens in an **isolated** Firebase app (`naa-admin-portal`) with in-memory persistence, so it never changes the public site's student sign-in state and leaves nothing in browser storage.
3. The browser calls `loginWithPasswordNaaAdmin`. The callable SDK attaches the Firebase ID token.
4. The backend decides everything on its own. It never reads an email, UID or `isAdmin` value from the request body. It requires:
   * an authenticated request (`request.auth`);
   * token email equal to the owner email (trimmed, case-insensitive, **exact** otherwise — Gmail dot/plus variants are different identities and are rejected);
   * `email_verified === true` on both the token and the live user record;
   * `sign_in_provider === "password"` on the token and an Email/Password provider on the live user record (Google sign-in can no longer create an admin session);
   * a live user record from the Admin SDK that is **not disabled** and whose tokens have not been revoked since the ID token was issued;
   * a sign-in within the last 5 minutes (a stale token cannot mint a session).
5. Only then it creates a session: 32 random bytes (`base64url`) returned to the browser once; Firestore stores only the SHA-256 hash as the document ID in `private_admin_sessions` with `uid`, `provider: "password"`, creation time and an **eight-hour** expiry. No password, ID token or raw session token is stored or logged.
6. The browser calls `verifyNaaAdminSession` and shows the signed-in state only after the server confirms. The session token lives in React memory only, so a refresh returns to the sign-in form (by design — there is no stored "logged in" flag). While signed in, the page re-verifies every 5 minutes and when the tab becomes visible, and signs out at expiry.
7. `logoutNaaAdmin` deletes the server-side session; the browser then signs out of Firebase.

`verifyNaaAdminSession` re-checks owner identity and the live account state on every call, so disabling the account or revoking tokens takes effect immediately. **Every future privileged admin endpoint must call `adminAuth.requireAdminSession(request)`** (exported from `adminAuthCore.js`) before doing any work. Hiding the route or rendering the UI is not authorization.

### Rate limiting and brute-force protection

There are two separate layers, and they protect different things:

* **Password guessing** happens at Firebase Authentication, before any of our code runs. Firebase applies its own throttling (`auth/too-many-requests`). Our functions cannot sit in front of that step.
* **Session issuing** is limited by our code in the collection `private_admin_rate_limits`: 8 attempts per 15-minute window per source IP **and** per authenticated UID, then a temporary 15-minute lockout (never permanent). A successful login clears the counters. Unauthenticated flooding cannot lock out the owner on a different connection. Trade-off: the owner can be paused for up to 15 minutes if they share a source IP with an abuser.

Weaker than before in one respect: the Google flow inherited Google's account protections (including 2-step verification). Firebase email/password has no second factor unless the project is upgraded to Identity Platform and multi-factor authentication is enabled. Until then, the owner password must be long (16+ characters), unique, and kept in a password manager. Consider also enabling App Check / reCAPTCHA protection for Authentication.

## B. Firebase Console setup (project `manofstudy-live`)

Menu names change over time; the intent is what matters.

1. **Authentication → Sign-in method:** enable **Email/Password** (not "Email link"). Keep **Google** enabled — the public student features use it.
2. **Authentication → Settings → Authorized domains:** ensure `naacollege.in` and `www.naacollege.in` are listed. This is required for the password-reset return link.
3. **Email enumeration protection:** turn it on if available (Authentication settings). Sign-in and reset responses are already worded so they never reveal whether an account exists; this setting makes Firebase itself consistent.
4. **Authentication → Templates → Password reset:** optionally customize the sender name/subject. The default action URL is fine; after resetting, the page offers a link back to `https://naacollege.in/theone`.
5. **Public sign-up exposure:** enabling Email/Password means anyone with the public web API key could create *an* email/password account. That cannot grant admin access (the backend allowlist and verified-email requirement decide), and sign-up cannot be switched off globally because students create Google accounts. If you want a hard block, an Identity Platform "blocking function" could reject non-owner password sign-ups; that is not implemented here.

### Provisioning the owner account (the owner chooses their own password)

Never commit, log, share or reuse a password. Do not use a default password.

1. Open **Authentication → Users** and search for `jaganmakes@gmail.com`. Note whether it exists and which **Provider** it shows. If it is a student account created through Google sign-in on the public site, it already exists — and with one account per email, Console "Add user" will refuse the same address.
2. **Does not exist:** use **Add user** with the owner email and a long random throw-away password you do not keep (the next step replaces it).
3. **Set the real password through Firebase's reset flow:** open `https://naacollege.in/theone` → *Forgot password?* → enter the owner email → follow the emailed link and choose a strong password. Completing the reset proves control of the inbox and is expected to mark the email as verified; **confirm in Console that the user now shows an Email/Password provider and a verified email.** Not verified in this task: how Firebase treats the reset link for an account that currently has only the Google provider. If after the reset the Email/Password provider is missing, or the email is not verified, use the fallback below.
4. **Fallback — trusted administrative script** (run by the owner on their own machine after `gcloud auth application-default login`, from the `functions/` directory; the password is typed at a hidden prompt, never placed in a file or command line):

   ```sh
   read -rs -p "New admin password: " NAA_PW; echo; export NAA_PW
   node -e '
   const { initializeApp, applicationDefault } = require("firebase-admin/app");
   const { getAuth } = require("firebase-admin/auth");
   initializeApp({ credential: applicationDefault(), projectId: "manofstudy-live" });
   (async () => {
     const auth = getAuth();
     const user = await auth.getUserByEmail("jaganmakes@gmail.com");
     await auth.updateUser(user.uid, { password: process.env.NAA_PW, emailVerified: true });
     console.log("updated", user.uid);
   })().catch((e) => { console.error(e.code || "error"); process.exit(1); });
   '
   unset NAA_PW
   ```

   Setting `emailVerified: true` is appropriate only because the owner controls that inbox. This script was written for this document and has not been run.
5. If a *different* unverified password account is ever found for the owner email that the owner did not create, delete it in Console and repeat the steps above.

## C. Deployment (manual — requires Firebase and Cloudflare access)

**Nothing in this PR deploys Firebase resources or the public Cloudflare site automatically.** Complete the checks below before production rollout.

### 1. Confirm the project and current functions

```sh
firebase use --project manofstudy-live
firebase functions:list --project manofstudy-live
```

Confirm the project shown is `manofstudy-live`. Do not deploy from an unfamiliar Firebase project.

### 2. Run local checks first

```sh
npm install
npm run lint
npm run build
node --test functions/adminAuthCore.test.js functions/adminCmsCore.test.js
```

The backend unit tests use fake auth and in-memory Firestore. They are not a substitute for verifying production Firebase Auth, Firestore, Storage, and email/password sign-in.

### 3. Deploy backend and security rules

The CMS adds nine callable functions and new Firestore and Storage rules. Deploy the current reviewed branch only after the build and tests pass:

```sh
firebase deploy --project manofstudy-live --only functions,firestore:rules,storage
```

This deploys the existing Functions codebase as well as the rules. The existing CampusConnect/other Functions are in the same codebase, so review the planned deployment output carefully. Do not continue if Firebase reports unexpected deletions, the wrong project, or build/startup errors.

The CMS callable functions are:

- `adminGetCmsWorkspace`
- `adminSaveCmsDraft`
- `adminPublishCmsItem`
- `adminUnpublishCmsItem`
- `adminDeleteCmsItem`
- `adminRestoreCmsTrashItem`
- `adminRestoreCmsRevision`
- `adminRegisterCmsMedia`
- `adminDeleteCmsMedia`

The existing admin auth functions remain `loginWithPasswordNaaAdmin`, `verifyNaaAdminSession`, and `logoutNaaAdmin`.

### 4. Verify Firebase owner credentials

In Firebase Console → Authentication → Sign-in method, enable **Email/Password** and keep **Google** enabled for existing student features. Then inspect Authentication → Users and confirm the authorized owner account has a password provider, a verified email, and is not disabled. Do not assume that resetting the password for a Google-only account necessarily adds the password provider. Preserve the existing Firebase UID and student data; never delete/recreate the account as a shortcut.

Use a strong, unique owner password. No password or service-account key belongs in source control.

### 5. Deploy the frontend separately

After the backend and rules are deployed and verified, publish the reviewed feature through the normal Cloudflare Pages workflow. The repository workflow runs checks/builds; it does not itself publish Firebase resources, and Cloudflare Pages production branch settings must be confirmed in the Cloudflare dashboard.

Use the existing URL `https://naacollege.in/theone`. Firebase callable CORS is configured for `https://naacollege.in` and `https://www.naacollege.in`; a `*.pages.dev` preview is not an accepted origin for the admin callable flow.

### 6. Verify the real production workflow

After both backend and frontend deployments:

1. Owner signs in and reaches the CMS dashboard.
2. A non-owner account is denied.
3. Draft saves remain private.
4. Publishing a blog changes the public blog list; publishing homepage copy changes the homepage hero; scholarship edits update the connected scholarship sections; the footer tagline, guides, roadmaps, and autonomous-college directory update through their connected runtime hooks.
5. Unpublish hides connected baseline items; restore from recycle bin brings them back.
6. Media upload succeeds only for the verified owner and allowed image types.
7. Public Google sign-in and student features still work.

The UI currently manages `tools`, `seo_settings`, and `datasets` metadata in the CMS, but all those fields are **not yet wired to their respective public components**. Large AP/TG allotment indexes remain outside the generic content editor to avoid changing admission calculations or search indexes.

## Verification

### Automated (run locally; no Firebase access needed)

```sh
node --test functions/adminAuthCore.test.js
npx tsx --test src/components/admin/adminAuthMessages.test.ts
npm run lint      # tsc --noEmit (needs `npm install`)
npm run build     # full production build (needs `npm install`)
```

The backend tests cover: owner success; case/whitespace normalization and rejection of look-alike emails; unauthorized email with a valid token; direct unauthenticated calls; forged client fields; unverified email (token and live record); Google and other providers; disabled and deleted accounts; revoked tokens; stale sign-ins; expired, foreign-UID and legacy-Google sessions; logout revocation; rate limiting (lockout, recovery after 15 minutes, per-source and per-UID, counters cleared on success); masking of internal errors; and that passwords, ID tokens and session tokens never appear in logs or Firestore. They run against an in-memory Firestore and fake Admin Auth, **not** the real Firebase services. **Wrong password** is rejected by Firebase Authentication itself before the callable is reached, so it is checked manually below.

### Manual production checklist (after deploying)

1. Owner email + correct password → signed in; a document appears in `private_admin_sessions` whose ID is a 64-character hash.
2. Owner email + wrong password → "Incorrect email or password."; no session document.
3. A Google-created student account cannot sign in on the admin form (no Google option exists), and calling `loginWithPasswordNaaAdmin` directly with a student's ID token returns `permission-denied`.
4. Forgot password with the owner email and with a made-up email show the **same** neutral message; no account is created for the made-up address.
5. Disable the owner in Console → sign-in fails with the "disabled" message; re-enable.
6. Refresh the page → sign-in form again. Sign out → the session document is deleted.
7. After 8 hours (or by deleting the session document) the page signs out on its next check.
8. Eight rapid failed attempts from one connection → "Too many sign-in attempts"; it clears after 15 minutes.
9. Public site: homepage, a student Google sign-in, and `/theone` on a phone and a desktop all load.

## Diagnosing backend failures safely

```sh
firebase functions:log --only loginWithPasswordNaaAdmin --project manofstudy-live
firebase functions:log --only verifyNaaAdminSession --project manofstudy-live
firebase functions:log --only logoutNaaAdmin --project manofstudy-live
```

Look for `[NaaAdminAuth] Unexpected server failure`. It records the function name, a processing stage, the error code, message and stack — never request bodies, passwords, ID tokens or session tokens. Stages: `rate-limit-source` / `rate-limit-uid` (Firestore rate-limit transaction failed), `owner-identity` (Admin SDK user lookup failed — check that the function's runtime service account can read Firebase Authentication users), `create-session` (Firestore write failed), `clear-rate-limit`, `session-check`, `read-session-for-revocation`, `revoke-session`.

If there are no invocation logs at all, confirm the functions exist in project `manofstudy-live` and region `asia-southeast1` (`firebase functions:list`) and check the Functions dashboard for build or startup errors. Do not weaken the allowlist or Firestore rules as a workaround. The browser deliberately shows only generic messages; use the server logs for detail.

## Scope and limitations

The repository now contains the private owner authentication/session layer, a CMS dashboard, server-side CMS callable handlers, Firestore/Storage rules, revision and recycle-bin operations, audit records, media registration, and runtime content overrides. Public live-content hooks currently cover homepage hero copy, featured homepage blogs/scholarships, the blog page, footer tagline, admission guides, roadmaps, and the autonomous-college directory. Tool/SEO/dataset records can be stored, but their individual public pages are not all connected to live updates yet. Large AP/TG allotment indexes intentionally remain in the validated repository data pipeline.

The current automated tests use fake auth and in-memory Firestore; they do not prove that production Firebase settings, the owner password provider, Storage permissions, email delivery, or the real deployment are correct. A green build is necessary but not sufficient. Do not describe the CMS as production-ready until the manual verification section above has been completed against the configured Firebase project and the live Cloudflare deployment.

Every future privileged admin operation must call `adminAuthCore.requireAdminSession(request)` on the server before reading or changing protected data. Do not add direct client SDK access to private CMS collections.
