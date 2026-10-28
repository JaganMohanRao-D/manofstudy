# Naa College private admin — Google owner authentication

The private owner route is `https://naacollege.in/theone`. The only permitted admin identity is `jaganmakes@gmail.com`.

## Authentication rules

- The UI uses Firebase Google sign-in only. There is no custom password field, public sign-up, or one-time setup-key flow.
- The browser makes a local email/provider check for quick feedback, but that check is not the security boundary.
- The callable backend independently requires a valid Firebase-authenticated request whose email exactly matches `jaganmakes@gmail.com`, whose `email_verified` claim is true, and whose Firebase sign-in provider is `google.com`.
- On successful server verification, the backend issues a random opaque session token, storing only its SHA-256 hash as the document ID, bound to the Firebase UID and expiring after eight hours.
- Session verification and logout also require the authenticated owner identity and matching UID.
- Login attempts are rate-limited server-side. Firestore client rules deny access to unmatched/private admin collections; Cloud Functions use Admin SDK on the server.

## Required Firebase Console settings

In the Firebase project configured by this repository (`manofstudy-live`):

1. Open **Authentication → Sign-in method** and ensure the **Google** provider is enabled.
2. Under **Authentication → Settings → Authorized domains**, ensure `naacollege.in` and `www.naacollege.in` are listed.
3. Confirm the deployed web app uses this same Firebase project and the existing authentication config.

Do not create a Firebase password account for this admin flow and do not add a public user registration route.

## Backend deployment

After reviewing the pull request, deploy these server functions to the configured Firebase project. This command does not deploy the Cloudflare Pages website:

```sh
firebase deploy --project manofstudy-live --only functions:loginWithGoogleNaaAdmin,functions:verifyNaaAdminSession,functions:logoutNaaAdmin
```

Then deploy the frontend through the normal reviewed Cloudflare Pages process and test:

1. `jaganmakes@gmail.com` signs in with Google and receives an owner session.
2. A different Google account is signed out and rejected with no admin session.
3. Unverified email or a non-Google Firebase provider is rejected by the callable backend.
4. A session from one Firebase UID cannot be reused by another UID, and expired sessions are denied.
5. Sign-out revokes the session token server-side.

## Scope and limitations

This PR establishes the owner authentication/session layer and isolated login page. It does not yet build the complete CMS/editor or connect publishing actions. Every future private admin write or publish endpoint must validate the server-side session and owner UID before performing its action; checking the route or hiding UI is not enough.

Google sign-in verifies account identity; it does not protect against someone who already controls the owner’s Google account. Keep that account secured with a unique password and two-step verification.
