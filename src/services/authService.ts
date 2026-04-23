import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onIdTokenChanged, signInWithEmailAndPassword, signOut, type Auth } from 'firebase/auth';
import { apiFetch, TokenStore } from './api.config';

export type BackendUser = {
  uid?: string;
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
};

type RegisterPayload = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type UpdateUserProfilePayload = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password?: string;
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

const requiredFirebaseConfig = [
  ['EXPO_PUBLIC_FIREBASE_API_KEY', firebaseConfig.apiKey],
  ['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
  ['EXPO_PUBLIC_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
  ['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket],
  ['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId],
  ['EXPO_PUBLIC_FIREBASE_APP_ID', firebaseConfig.appId],
] as const;

const missingFirebaseConfig = requiredFirebaseConfig
  .filter(([, value]) => !value?.trim())
  .map(([key]) => key);

if (missingFirebaseConfig.length > 0) {
  throw new Error(`Missing Firebase configuration: ${missingFirebaseConfig.join(', ')}`);
}

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth: Auth = getAuth(firebaseApp);

onIdTokenChanged(firebaseAuth, async (user) => {
  if (!user) {
    await TokenStore.clear();
    return;
  }

  const token = await user.getIdToken();
  await TokenStore.set(token);
});

export const registerUser = async (payload: RegisterPayload): Promise<BackendUser> => {
  return apiFetch<BackendUser>('/api/auth/register', {
    method: 'POST',
    body: {
      firstName: payload.firstName,
      middleName: payload.middleName ?? '',
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
    },
  });
};

export const loginUser = async ({ email, password }: LoginPayload): Promise<BackendUser> => {
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
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

export const updateUserProfile = async (uid: string, payload: UpdateUserProfilePayload): Promise<BackendUser> => {
  const { password: _password, ...body } = payload;

  return apiFetch<BackendUser>(`/api/users/${uid}`, {
    method: 'PATCH',
    body,
    withAuth: true,
  });
};
