// src/services/authService.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  type Auth,
} from 'firebase/auth';
import { apiFetch, TokenStore } from './api.config';

export type BackendUser = {
  uid?: string;
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth: Auth = getAuth(firebaseApp);

// keep token fresh
onIdTokenChanged(firebaseAuth, async (user) => {
  if (!user) {
    await TokenStore.clear();
    return;
  }
  const token = await user.getIdToken();
  await TokenStore.set(token);
});

export const registerUser = async (payload: {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<BackendUser> => {
  return apiFetch<BackendUser>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<BackendUser> => {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    payload.email,
    payload.password
  );
  const token = await credential.user.getIdToken();
  await TokenStore.set(token);

  return apiFetch<BackendUser>('/api/auth/login', {
    method: 'POST',
    body: { token },
  });
};

export const logoutUser = async (): Promise<void> => {
  await signOut(firebaseAuth);
  await TokenStore.clear();
};

export const updateUserProfile = async (
  uid: string,
  payload: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
  }
): Promise<BackendUser> => {
  return apiFetch<BackendUser>(`/api/users/${uid}`, {
    method: 'PATCH',
    body: payload,
    withAuth: true,
  });
};