# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server (opens QR code / menu)
npm run android    # Launch on Android emulator or device
npm run ios        # Launch on iOS simulator
npm run web        # Launch in browser
npm run typecheck  # Run TypeScript type-check without emitting files
```

No test runner is configured. TypeScript is the only static check available (`npm run typecheck`).

## Environment Variables

Create a `.env.local` file (gitignored) with:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_DATABASE_URL=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_API_BASE_URL=http://<your-machine-ip>:8081
```

`EXPO_PUBLIC_API_BASE_URL` defaults to `http://192.168.68.27:8081` when unset (see `src/services/api.config.ts`).

## Architecture

### Entry Point & Navigation

`App.js` → `src/navigation/RootNavigator.tsx` wraps everything in `AuthProvider`. Inside, `RootNavigationContent` reads `isAuthenticated` from `useAuth` and renders either `AuthStack` or `AppStack` inside a single `NavigationContainer`.

- **AuthStack** (`src/navigation/AuthStack.tsx`): `SignIn` → `Login`
- **AppStack** (`src/navigation/AppStack.tsx`): `Dashboard` → `Location` / `ParkingSlots` / `EditAccount`

Navigation param types live in `src/types/navigation.ts`.

### Auth Flow

`src/hooks/useAuth.tsx` exports `AuthProvider` and `useAuth`. The context holds `user`, `uid`, and `isAuthenticated` in React state — there is no persistence, so the user is always logged out on app restart.

`src/services/authService.ts` handles the two-step login:
1. Firebase `signInWithEmailAndPassword` to obtain a Firebase ID token.
2. POST that token to `POST /api/auth/login` on the backend; the response contains the `BackendUser` profile.

`onIdTokenChanged` keeps `TokenStore` (AsyncStorage) fresh whenever Firebase rotates the token.

### API Layer

`src/services/api.config.ts` provides:
- `apiFetch<T>(path, options)` — typed fetch wrapper that reads the Bearer token from `TokenStore` when `withAuth: true`, serializes JSON bodies, and unwraps `{ success, data }` responses.
- `TokenStore` — thin AsyncStorage wrapper for the auth token (key `@flexpark_auth_token`).

The backend API always returns `{ success: true, data: T }` or `{ success: false, error: string }`.

### Parking Data

`src/services/parkingService.ts` fetches parking lots and their grid layouts, then flattens them into the `ParkingSlot` type:
- `fetchAllParkingLots()` → `GET /api/parking-lots`
- `fetchLayoutsForLot(lotId)` → `GET /api/parking-lots/:lotId/mobile-layout` (returns grid cells with live slot statuses)
- `fetchParkingSlots()` — combines the above into the full `ParkingSlot[]` shape consumed by the UI

`src/hooks/useParkingLots.ts` wraps `fetchParkingSlots` with loading/error state and optional auto-refresh via `setInterval`.

### Theming

All design tokens (colors, spacing, radius, typography, shadows) are in `src/theme/index.ts`. Import directly from `../../theme` in screens and components. Do not hard-code color or spacing values.

### Key Type Definitions

`src/types/parking.ts` defines `ParkingSlot`, `ParkingSpace`, `ParkingLayout`, `GridCell`, `SpotData`, and related types shared between the service layer and UI.
