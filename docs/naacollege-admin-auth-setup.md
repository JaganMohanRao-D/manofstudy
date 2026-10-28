# Naa College private admin — Google owner authentication and diagnostics

The private owner route is `https://naacollege.in/theone`. The only permitted admin identity is allowlisted inside Firebase Cloud Functions; the frontend does not render the owner email.

## Authentication and session safeguards

- The UI uses Firebase Google sign-in only. There is no custom password field, public signup, or setup-key flow.
- The browser initiates Google sign-in and calls a callable function. The backend independently checks the authenticated Firebase UID, the exact owner email, `email_verified === true`, and Firebase sign-in provider `google.com`.
- On successful server verification, the backend issues a random opaque session token, stores only its SHA-256 hash as the Firestore document ID, binds the session to the Firebase UID, and sets an eight-hour expiry.
- The email allowlist is not returned by callable responses. Auth/session errors displayed to visitors do not expose the owner address or raw server error details.
- Unexpected backend failures now emit a sanitized `[NaaAdminAuth] Unexpected server failure` log with function name, processing stage, error code, message and stack. The log does not include request bodies, ID tokens, or session tokens.
- Firestore client rules deny access to unmatched/private collections. Firebase Admin SDK operations use the Cloud Functions runtime service account and are governed by Google Cloud IAM, not client Firestore rules.

## Diagnose the current `internal [0]` issue

A callable function can return an `INTERNAL` error when it throws an unhandled exception. The frontend cannot identify the root cause from `internal [0]` alone. Check the actual Cloud Functions logs:

```sh
firebase functions:log --only loginWithGoogleNaaAdmin --project manofstudy-live
firebase functions:log --only verifyNaaAdminSession --project manofstudy-live
firebase functions:list --project manofstudy-live
```

Look for `[NaaAdminAuth] Unexpected server failure` and inspect its `stage`:
- `rate-limit`: Firestore access/transaction for rate limiting failed.
- `create-session`: Firestore write for the new session failed.
- `read-session`: Firestore read for session verification failed.
- `revoke-session`: Firestore read/delete for revocation failed.
- `owner-identity`: unexpected failure while validating the authenticated identity.

If no matching invocation logs appear, confirm the callable is deployed in the correct project and region, and inspect the Firebase Functions dashboard for missing deployments or startup errors. If the log identifies IAM/Firestore access failure, check the runtime service account's access to project `manofstudy-live`. Do not weaken the identity allowlist or change Firestore rules as a workaround.

## Firebase settings and deployment

In the Firebase project identified by the repository config (`manofstudy-live`):

1. Open **Authentication → Sign-in method** and ensure the **Google** provider is enabled.
2. Under **Authentication → Settings → Authorized domains**, ensure `naacollege.in` and `www.naacollege.in` are listed.
3. Confirm frontend and callable functions belong to the same Firebase project.
4. Ensure the three callable functions below are deployed in region `asia-southeast1`.

This repository's workflow runs audits/build checks; it does not automatically deploy Firebase Cloud Functions. After the source is reviewed, deploy just the auth functions from a trusted local checkout with Firebase CLI access:

```sh
firebase deploy --project manofstudy-live --only functions:loginWithGoogleNaaAdmin,functions:verifyNaaAdminSession,functions:logoutNaaAdmin
```

Deploy the frontend separately through the normal reviewed Cloudflare Pages process. Do not deploy before confirming the target Firebase project.

## Runtime test checklist

1. The verified owner Google account signs in and receives a session.
2. A different Google account is signed out and rejected without a session.
3. Unverified email or a non-Google sign-in provider is rejected by the backend.
4. A session is rejected if expired, revoked, or presented by a different Firebase UID.
5. If the callable is not deployed or unavailable, the UI shows a concise error instead of raw `internal [0]`.
6. The owner email is absent from frontend source/UI and callable responses, while the backend allowlist remains enforced.
7. Sign-out revokes the session server-side.

## Scope

The code provides the private owner authentication/session layer and a minimal login page. It does not yet build the complete CMS/editor or connect content publishing actions. Every future admin write/publish endpoint must validate the server-side session and owner UID before changing content. Do not treat hiding the route or rendering the UI as authorization.

Google sign-in verifies the account identity; it does not protect an account that has been taken over. Keep the owner Google account protected with a unique password and two-step verification.
