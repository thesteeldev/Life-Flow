// firebase.js
// Firebase App Configuration — all credentials loaded from environment variables.
// Create a .env file in your project root and populate it with your Firebase project values.
// NEVER commit .env to version control — add it to .gitignore.

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// ---------------------------------------------------------------------------
// Environment-variable-driven config (Vite exposes VITE_* vars via import.meta.env)
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// ---------------------------------------------------------------------------
// Guard: warn loudly in development if any required variable is missing.
// This prevents silent auth failures caused by a misconfigured .env file.
// ---------------------------------------------------------------------------
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    console.error(
      "[Firebase] Missing environment variables:",
      missing,
      "\nMake sure your .env file contains all required VITE_FIREBASE_* keys."
    );
  }
}

// ---------------------------------------------------------------------------
// Initialise Firebase
// ---------------------------------------------------------------------------
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ---------------------------------------------------------------------------
// Auth Providers
// ---------------------------------------------------------------------------
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const githubProvider = new GithubAuthProvider();
// Add GitHub scopes you need (user:email is required to read the user's email)
githubProvider.addScope("user:email");

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export { auth, googleProvider, githubProvider };
export default app;