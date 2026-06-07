// LoginPage.jsx
// Production-ready Login Page for "Productivity Command Center"
// Stack: React + Vite + Tailwind CSS + Firebase Authentication
//
// Prerequisites (run in your project root):
//   npm install firebase
//
// .env file (project root, never commit):
//   VITE_FIREBASE_API_KEY=...
//   VITE_FIREBASE_AUTH_DOMAIN=...
//   VITE_FIREBASE_PROJECT_ID=...
//   VITE_FIREBASE_STORAGE_BUCKET=...
//   VITE_FIREBASE_MESSAGING_SENDER_ID=...
//   VITE_FIREBASE_APP_ID=...

import { useState, useCallback } from "react";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "./firebase";

// ---------------------------------------------------------------------------
// SVG Icon components (inline — no extra dependency needed)
// ---------------------------------------------------------------------------
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

// ---------------------------------------------------------------------------
// Error message parser — converts Firebase error codes to human-readable text
// ---------------------------------------------------------------------------
const parseFirebaseError = (code) => {
  const map = {
    "auth/user-not-found":        "No account found with this email.",
    "auth/wrong-password":        "Incorrect password. Please try again.",
    "auth/invalid-email":         "Please enter a valid email address.",
    "auth/user-disabled":         "This account has been disabled.",
    "auth/too-many-requests":     "Too many attempts. Please wait a moment.",
    "auth/popup-closed-by-user":  "Sign-in popup was closed. Please try again.",
    "auth/popup-blocked":         "Popup was blocked by your browser. Please allow popups.",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email using a different sign-in method.",
    "auth/cancelled-popup-request": null, // suppress — user cancelled intentionally
  };
  return map[code] ?? "Something went wrong. Please try again.";
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function LoginPage({ onLoginSuccess }) {
  // Form state
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);

  // Async state
  const [loading,     setLoading]     = useState(null); // "email" | "google" | "github" | null
  const [error,       setError]       = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // -------------------------------------------------------------------
  // Client-side validation
  // -------------------------------------------------------------------
  const validate = () => {
    const errs = {};
    if (!email)                          errs.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email   = "Enter a valid email.";
    if (!password)                       errs.password = "Password is required.";
    else if (password.length < 6)        errs.password = "Password must be at least 6 characters.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // -------------------------------------------------------------------
  // Email / Password Sign-in
  // -------------------------------------------------------------------
  const handleEmailSignIn = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      if (!validate()) return;

      setLoading("email");
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess?.(result.user);
      } catch (err) {
        const msg = parseFirebaseError(err.code);
        if (msg) setError(msg);
      } finally {
        setLoading(null);
      }
    },
    [email, password, onLoginSuccess]
  );

  // -------------------------------------------------------------------
  // OAuth helpers
  // -------------------------------------------------------------------
  const handleOAuthSignIn = useCallback(
    async (provider, key) => {
      setError("");
      setLoading(key);
      try {
        const result = await signInWithPopup(auth, provider);
        onLoginSuccess?.(result.user);
      } catch (err) {
        const msg = parseFirebaseError(err.code);
        if (msg) setError(msg);
      } finally {
        setLoading(null);
      }
    },
    [onLoginSuccess]
  );

  const handleGoogleSignIn = () => handleOAuthSignIn(googleProvider, "google");
  const handleGithubSignIn = () => handleOAuthSignIn(githubProvider, "github");

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <>
      {/* ----------------------------------------------------------------
          Global styles injected once — keeps the component self-contained
          without requiring changes to index.css or tailwind config.
      ---------------------------------------------------------------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .pcc-root {
          font-family: 'DM Sans', sans-serif;
        }
        .pcc-display {
          font-family: 'Syne', sans-serif;
        }

        /* Animated gradient mesh background */
        .pcc-bg {
          background: #060612;
          position: relative;
          overflow: hidden;
        }
        .pcc-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 20% 20%, rgba(99,28,212,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 45% at 85% 75%, rgba(6,182,212,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 65% 15%, rgba(168,85,247,0.18) 0%, transparent 55%);
          animation: meshFloat 12s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes meshFloat {
          0%   { transform: translate(0,    0)    scale(1); }
          33%  { transform: translate(20px, -15px) scale(1.04); }
          66%  { transform: translate(-10px, 20px) scale(0.97); }
          100% { transform: translate(15px,  10px) scale(1.02); }
        }

        /* Noise grain overlay */
        .pcc-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.5;
        }

        /* Glassmorphism card */
        .glass-card {
          background: rgba(15, 12, 35, 0.6);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(139, 92, 246, 0.18);
          box-shadow:
            0 0 0 1px rgba(6,182,212,0.08) inset,
            0 32px 80px rgba(0,0,0,0.55),
            0 0 60px rgba(99,28,212,0.12);
        }

        /* Neon glow ring on focus */
        .neon-input:focus {
          outline: none;
          border-color: rgba(6,182,212,0.6);
          box-shadow: 0 0 0 3px rgba(6,182,212,0.12), 0 0 14px rgba(6,182,212,0.15);
        }
        .neon-input {
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        /* Primary CTA — cyan→purple gradient with glow */
        .btn-primary {
          background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%);
          box-shadow: 0 4px 24px rgba(6,182,212,0.22), 0 2px 8px rgba(124,58,237,0.18);
          transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .btn-primary:hover:not(:disabled) {
          filter: brightness(1.12);
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(6,182,212,0.32), 0 4px 12px rgba(124,58,237,0.25);
        }
        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
          filter: brightness(0.96);
        }

        /* OAuth buttons */
        .btn-oauth {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .btn-oauth:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .btn-oauth:active:not(:disabled) {
          transform: translateY(0);
          background: rgba(255,255,255,0.05);
        }

        /* Divider gradient lines */
        .divider-line {
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.35), transparent);
          height: 1px;
          flex: 1;
        }

        /* Spinner */
        .spin { animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Card entrance */
        .card-entrance {
          animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        /* Error shake */
        .shake {
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }

        /* Neon dot pulse on logo */
        .pulse-dot {
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1;   transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.6); }
        }
      `}</style>

      {/* ----------------------------------------------------------------
          Full-screen background
      ---------------------------------------------------------------- */}
      <div className="pcc-root pcc-bg min-h-screen w-full flex items-center justify-center px-4 py-12">

        {/* Decorative floating orbs (CSS-only, pure atmosphere) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: "12%", left: "8%",
            width: 320, height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute", bottom: "10%", right: "7%",
            width: 280, height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* ----------------------------------------------------------------
            Glass card
        ---------------------------------------------------------------- */}
        <div
          className="glass-card card-entrance relative w-full max-w-md rounded-3xl px-8 py-10 sm:px-10"
          role="main"
        >
          {/* Top neon accent line */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: 0, left: "20%", right: "20%", height: 2,
              background: "linear-gradient(90deg, transparent, #06b6d4, #7c3aed, transparent)",
              borderRadius: "0 0 8px 8px",
            }}
          />

          {/* ---- Logo / Brand ---- */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="pulse-dot absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div>
              <p className="pcc-display text-white font-bold text-base leading-tight tracking-tight">
                Command Center
              </p>
              <p className="text-xs text-purple-300/70 font-light tracking-widest uppercase">
                Productivity OS
              </p>
            </div>
          </div>

          {/* ---- Heading ---- */}
          <div className="mb-8">
            <h1 className="pcc-display text-white text-3xl font-extrabold leading-tight">
              Welcome back
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-light">
              Sign in to access your workspace.
            </p>
          </div>

          {/* ---- Global error banner ---- */}
          {error && (
            <div
              role="alert"
              className="shake mb-5 rounded-xl px-4 py-3 text-sm text-red-300 border border-red-500/25"
              style={{ background: "rgba(239,68,68,0.08)" }}
            >
              <span className="mr-2">⚠</span>{error}
            </div>
          )}

          {/* ---- Email / Password form ---- */}
          <form onSubmit={handleEmailSignIn} noValidate className="space-y-4">

            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-slate-300 tracking-wide uppercase">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="you@example.com"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-err" : undefined}
                className={`neon-input w-full rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600
                  bg-white/5 border
                  ${fieldErrors.email ? "border-red-500/60" : "border-white/10"}
                  focus:bg-white/7`}
              />
              {fieldErrors.email && (
                <p id="email-err" role="alert" className="text-xs text-red-400 mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-slate-300 tracking-wide uppercase">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none focus-visible:underline"
                  tabIndex={0}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder="••••••••"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "pass-err" : undefined}
                  className={`neon-input w-full rounded-xl px-4 py-3 pr-11 text-sm text-slate-100 placeholder-slate-600
                    bg-white/5 border
                    ${fieldErrors.password ? "border-red-500/60" : "border-white/10"}`}
                />
                <button
                  type="button"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {fieldErrors.password && (
                <p id="pass-err" role="alert" className="text-xs text-red-400 mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!!loading}
              className="btn-primary w-full rounded-xl py-3 text-sm font-semibold text-white tracking-wide
                flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === "email" ? (
                <>
                  <svg className="spin w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* ---- Divider ---- */}
          <div className="flex items-center gap-3 my-7">
            <div className="divider-line" />
            <span className="text-xs text-slate-500 tracking-widest uppercase font-light whitespace-nowrap">
              or continue with
            </span>
            <div className="divider-line" />
          </div>

          {/* ---- OAuth buttons ---- */}
          <div className="space-y-3">

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={!!loading}
              aria-label="Sign in with Google"
              className="btn-oauth w-full rounded-xl py-3 px-4 flex items-center justify-center gap-3
                text-sm font-medium text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === "google" ? (
                <svg className="spin w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                </svg>
              ) : (
                <GoogleIcon />
              )}
              <span>Sign in with Google</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={!!loading}
              aria-label="Sign in with GitHub"
              className="btn-oauth w-full rounded-xl py-3 px-4 flex items-center justify-center gap-3
                text-sm font-medium text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === "github" ? (
                <svg className="spin w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                </svg>
              ) : (
                <GitHubIcon />
              )}
              <span>Sign in with GitHub</span>
            </button>
          </div>

          {/* ---- Footer ---- */}
          <p className="text-center text-xs text-slate-600 mt-8">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors focus:outline-none focus-visible:underline"
            >
              Request access
            </button>
          </p>

          {/* Bottom neon accent line */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute", bottom: 0, left: "30%", right: "30%", height: 1,
              background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)",
              borderRadius: "8px 8px 0 0",
            }}
          />
        </div>
      </div>
    </>
  );
}