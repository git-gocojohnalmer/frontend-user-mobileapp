# Security Fixes Applied

## Status

The security changes in this branch are now aligned with the current code. The initial pass had a few implementation mismatches that would have broken authentication at runtime, and those are fixed here.

## Fixes

### 1. Firebase credentials moved to environment variables
- Status: Resolved
- `src/services/authService.ts` now reads `EXPO_PUBLIC_FIREBASE_*` values from the environment.
- `.env.example` documents all required Firebase values plus API base URL guidance for emulator, simulator, and physical device setups.
- Startup now throws a clear error when required Firebase variables are missing instead of failing later with a vague Firebase init error.

### 2. Password removed from persisted profile state
- Status: Resolved
- `UserProfile` no longer contains a password.
- Registration uses a dedicated `RegisterProfile` type so signup can still submit a password without storing it in profile state.
- The edit-account screen no longer exposes password fields.

### 3. Auth token persistence added
- Status: Resolved
- Tokens are stored through `@react-native-async-storage/async-storage`.
- `TokenStore` is asynchronous and shared by the API layer and auth service.
- Tokens now persist across app restarts.

### 4. Auth service contract fixed
- Status: Resolved
- `apiFetch()` already returns the unwrapped `data` payload, so `authService.ts` no longer treats responses as `{ success, data }`.
- Removed double JSON encoding from register, login, and update requests.
- Profile updates now send the bearer token with `withAuth: true`.

### 5. API error handling improved
- Status: Resolved
- Invalid JSON responses now throw a controlled error.
- API base URLs are normalized so trailing slashes do not produce malformed request paths.

### 6. Dashboard null-safety preserved
- Status: Resolved
- Dashboard quick actions still guard against missing `nearestSpot` ids before navigating.

## Setup

1. Install dependencies with `npm install`.
2. Create `.env` from `.env.example`.
   PowerShell: `Copy-Item .env.example .env`
3. Fill in the real Firebase values and set the correct API base URL for your device target.
4. Start the app with `npm start`.

## Recommendations

- Use `expo-secure-store` for auth tokens in production builds. AsyncStorage is persistent but not hardened secure storage.
- Add a startup auth bootstrap that restores the Firebase session and loads the backend profile on app launch.
- Add request timeouts and clearer offline/network error messages in `apiFetch()`.
- Add an `npm run typecheck` script so TypeScript regressions are caught before commits.
