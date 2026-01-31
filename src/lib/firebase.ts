import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getAdditionalUserInfo,
  Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization to avoid SSR issues
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

function getFirebaseApp() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

function getFirebaseAuth() {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      auth = getAuth(firebaseApp);
    }
  }
  return auth;
}

function getGoogleProvider() {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
  }
  return googleProvider;
}

// Auth functions
export async function signInWithGoogle() {
  const authInstance = getFirebaseAuth();
  const provider = getGoogleProvider();
  if (!authInstance || !provider) {
    return { user: null, error: 'Firebase not initialized', isNewUser: false };
  }
  try {
    const result = await signInWithPopup(authInstance, provider);
    const additionalInfo = getAdditionalUserInfo(result);
    return { user: result.user, error: null, isNewUser: additionalInfo?.isNewUser ?? false };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Sign in failed', isNewUser: false };
  }
}

export async function signInWithEmail(email: string, password: string) {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    return { user: null, error: 'Firebase not initialized' };
  }
  try {
    const result = await signInWithEmailAndPassword(authInstance, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Sign in failed' };
  }
}

export async function signUpWithEmail(email: string, password: string) {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    return { user: null, error: 'Firebase not initialized' };
  }
  try {
    const result = await createUserWithEmailAndPassword(authInstance, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : 'Sign up failed' };
  }
}

export async function logOut() {
  const authInstance = getFirebaseAuth();
  if (!authInstance) {
    return { error: 'Firebase not initialized' };
  }
  try {
    await signOut(authInstance);
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Sign out failed' };
  }
}

// Export a getter for auth to use in contexts
export { getFirebaseAuth, onAuthStateChanged };
export type { User };
