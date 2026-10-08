import { useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// On web this lets the browser close the auth window after redirecting back.
// It is a harmless no-op on iOS/Android.
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs live in .env. EXPO_PUBLIC_* values are public by
// design (only client IDs, never secrets). Expo inlines
// `process.env.EXPO_PUBLIC_*` at build time, so every name must be written
// out literally here — dynamic process.env lookups do not work.
const CLIENT_ID_ENV_VAR =
  Platform.OS === 'ios'
    ? 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'
    : Platform.OS === 'android'
      ? 'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
      : 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID';

const GOOGLE_CLIENT_ID =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || ''
    : Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || ''
      : process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID ||
        '';

const isConfigured = GOOGLE_CLIENT_ID.trim().length > 0;

// Placeholder keeps the auth hook from throwing at render time when the env
// var is unset — signIn() reports the missing configuration to the user before
// any browser is opened, so this value is never sent to Google.
const CLIENT_ID = isConfigured
  ? GOOGLE_CLIENT_ID.trim()
  : 'GOOGLE_CLIENT_ID_NOT_SET';

// Must match the redirect used in the authorization request so Google accepts
// the PKCE code exchange. Passing it explicitly keeps both steps in sync.
const REDIRECT_URI = AuthSession.makeRedirectUri({
  native: `${Application.applicationId}:/oauthredirect`,
});

// Google sign-in has no sign-up form, so create the same users/{uid} document
// that SignUpScreen writes for email/password accounts (non-blocking).
async function ensureProfileDoc(user: User): Promise<void> {
  try {
    const ref = doc(db, 'users', user.uid);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) return;
    await setDoc(ref, {
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      currency: '$',
      monthlyBudget: 0,
      categoryLimits: {},
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // AuthContext falls back to sensible defaults when the doc is absent.
    console.warn('Could not create profile document after Google sign-in:', err);
  }
}

/** Map Firebase, Google, and expo-auth-session failures to a friendly message. */
function describeGoogleError(err: unknown): string {
  const failure = err as {
    code?: unknown;
    message?: unknown;
    error?: unknown;
    description?: unknown;
  } | null;

  const code = typeof failure?.code === 'string' ? failure.code : '';
  const message = typeof failure?.message === 'string' ? failure.message : '';
  const googleError = typeof failure?.error === 'string' ? failure.error : '';
  const description =
    typeof failure?.description === 'string' ? failure.description : '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase. Enable it in Firebase Authentication → Sign-in method → Google.';
    case 'auth/unauthorized-domain':
      return "This app's domain is not authorized for Google sign-in. Add it under Firebase Authentication → Settings → Authorized domains.";
    case 'auth/popup-blocked':
      return 'The sign-in window was blocked. Allow pop-ups for this site and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/network-request-failed':
      return 'Network error during Google sign-in. Check your connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/invalid-credential':
    case 'auth/user-token-expired':
      return 'Google sign-in failed. Please try again.';
    default:
      break;
  }

  const raw = `${googleError} ${description} ${message}`;
  if (raw.includes('redirect_uri_mismatch')) {
    return "Google rejected this app's redirect URL. Register the redirect URI on the OAuth client ID in Google Cloud Console → Credentials.";
  }
  if (raw.includes('access_denied')) {
    return 'Google sign-in was denied. Allow access when prompted and try again.';
  }
  if (raw.includes('invalid_client') || raw.includes('unauthorized_client')) {
    return `The Google OAuth client ID is not valid for this app. Check ${CLIENT_ID_ENV_VAR} in .env.`;
  }
  if (raw.includes('invalid_grant')) {
    return 'The Google sign-in session expired. Please try again.';
  }

  return message || 'Google sign-in failed. Please try again.';
}

/**
 * Firebase Google sign-in via expo-auth-session (browser flow — works in
 * Expo Go and in development/production builds, no native module needed).
 *
 * `signIn()` resolves on success or silent cancellation, and rejects with a
 * user-friendly Error message otherwise. Success signs into Firebase with a
 * Google credential; the existing onAuthStateChanged listener in AuthContext
 * routes into the app exactly like email/password sign-in.
 */
export default function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const busyRef = useRef(false);

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    selectAccount: true,
    // Exchange the authorization code inside signIn() instead of an effect so
    // every failure reaches the caller and can be shown on the screen.
    shouldAutoExchangeCode: false,
  });

  const signIn = async (): Promise<void> => {
    // Re-entry guard: ignore taps while an attempt is already in flight.
    if (busyRef.current) return;

    busyRef.current = true;
    setLoading(true);
    try {
      // Web: use Firebase's own popup flow. It requires no OAuth client ID —
      // Firebase uses its preconfigured web client and authorized domains
      // (project.firebaseapp.com / localhost), which are enabled by default.
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        await ensureProfileDoc(userCredential.user);
        return;
      }

      if (!isConfigured) {
        throw new Error(
          `Google sign-in is not configured yet. Create a Google OAuth client ID for this app (Google Cloud Console → Credentials → OAuth client ID), add it as ${CLIENT_ID_ENV_VAR} to .env, then restart Expo.`
        );
      }
      if (!request) {
        throw new Error(
          'Google sign-in is still initializing. Please try again in a moment.'
        );
      }

      const result = await promptAsync();

      // The user closed or dismissed the browser — treat as a silent cancel.
      if (result.type === 'cancel' || result.type === 'dismiss') return;
      if (result.type === 'error') {
        throw new Error(describeGoogleError(result.error));
      }
      if (result.type !== 'success') return;

      let idToken: string | undefined = result.params.id_token;

      if (!idToken && result.params.code) {
        // Native flow: Google returns a PKCE authorization code instead of an
        // implicit id_token; exchange it for tokens with the same verifier.
        const token = await AuthSession.exchangeCodeAsync(
          {
            clientId: CLIENT_ID,
            redirectUri: REDIRECT_URI,
            code: result.params.code,
            extraParams: { code_verifier: request.codeVerifier || '' },
          },
          Google.discovery
        );
        idToken = token.idToken;
      }

      if (!idToken) {
        throw new Error('Google did not return a sign-in token. Please try again.');
      }

      // Standard Firebase credential sign-in. AuthContext's listener takes it
      // from here (same navigation flow as email/password sign-in).
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      await ensureProfileDoc(userCredential.user);
    } catch (err) {
      throw new Error(describeGoogleError(err));
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  };

  return { signIn, loading };
}
