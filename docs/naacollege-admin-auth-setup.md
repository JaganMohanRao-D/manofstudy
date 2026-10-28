# Naa College private admin authentication

The private route is `/theone`. The owner identifier is fixed to `jaganmakes@gmail.com`; Google login and public registration are not used.

## Deployment architecture

The website is served by Cloudflare Pages, while this repository already uses Firebase Cloud Functions for server-side work. The setup key therefore belongs in **Firebase Secret Manager**, consumed only by the `initializeNaaAdmin` function. Do not place it in a Vite variable, frontend `.env` file, source file, GitHub secret that gets injected into the client build, or public JSON.

## One-time setup

Run these commands locally from the repository root, using the Firebase project configured in this repository (`manofstudy-live`) or confirm the project ID with your Firebase Console first:

1. Generate a high-entropy key locally:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
   ```

   Keep the output private. Do not paste it into a chat or commit it.

2. Configure the server-side secret. When prompted, paste the generated value:

   ```sh
   firebase functions:secrets:set ADMIN_SETUP_KEY --project manofstudy-live
   ```

3. Deploy only the new authentication functions (this command does not deploy the website):

   ```sh
   firebase deploy --project manofstudy-live --only functions:adminSetupStatus,functions:initializeNaaAdmin,functions:loginNaaAdmin,functions:verifyNaaAdminSession,functions:logoutNaaAdmin
   ```

4. Deploy the website branch through the normal review/Cloudflare Pages process. After both backend and frontend are deployed, open `https://naacollege.in/theone`, enter the one-time setup key, and create a password of at least 12 characters. The key is never stored in Firestore. The setup is transactionally claimed once, and a separate server-side marker prevents automatic re-opening if the credential record is accidentally removed later.

5. Sign in with `jaganmakes@gmail.com` and the password just created. The session token is held in component memory only; refreshing the page requires signing in again. Sessions expire after eight hours. Login and setup attempts are rate-limited by source IP.

## Security boundaries

- The password is hashed server-side with Node.js scrypt and a per-password random salt. The raw password is not written to Firestore, source files, or build assets.
- Firestore rules deny direct client access to the private admin records. Functions use the Admin SDK on the server.
- Every future admin write/publish function must validate the in-memory session token with the server-side session check before changing content. Hiding the route or rendering a dashboard is not authorization.
- The password input is masked in the UI, but no website can prevent a person with full control of their own browser/devtools from inspecting values they type or requests their browser sends. The security guarantee is that the password is not embedded or persistently stored in the public frontend, and the server stores only a hash.
- The one-time key must remain private. If it is exposed before setup, rotate the Secret Manager value before using the setup page.
- Forgot-password recovery is intentionally not exposed as a public endpoint; an owner-controlled server-side recovery procedure must be designed separately rather than permitting open self-service account claiming.
