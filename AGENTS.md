# Repository Guidelines

## Project Structure & Module Organization

`App.js` is the entry point, `src/navigation/` holds stacks, and `src/types/navigation.ts` holds route params. Put page views in `src/screens/auth/` or `src/screens/app/`, reusable UI in `src/components/`, and stateful data access in `src/hooks/` and `src/services/`. Firebase setup is in `src/lib/firebase.ts`; domain models are in `src/types/`; design tokens are in `src/theme/index.ts`; static images are in `assets/`.

Keep screens compositional, hooks focused on state and lifecycle, and services focused on Firebase or HTTP translation. Reuse typed parking models rather than duplicating API shapes in UI files.

## Build, Test, and Development Commands

- `npm install` installs dependencies.
- `npm start` starts the Expo development server.
- `npm run android`, `npm run ios`, and `npm run web` open the selected target.
- `npm run typecheck` runs TypeScript validation without emitting files; run it before every PR.

No build or test script is configured.

## Coding Style & Naming Conventions

Use TypeScript, two-space indentation, single quotes, and semicolons, matching the existing files. Name React components, screens, and types with `PascalCase`; use `camelCase` for values and functions; and prefix hooks with `use` (for example, `useParkingLots`). Keep component filenames aligned with the exported component, such as `ParkingGrid.tsx`.

Use `StyleSheet.create` for React Native styles and import `colors`, `spacing`, `radius`, `typography`, and `shadows` from `src/theme` instead of adding ad hoc visual constants. Keep navigation changes synchronized with the typed stack params.

## Testing Guidelines

No test framework or coverage threshold is configured. At minimum, run `npm run typecheck` and manually exercise the affected Expo flow on an appropriate target. If adding tests, add the runner and script in the same PR and use colocated `*.test.ts(x)` files or a nearby `__tests__/` directory.

## Commit and Pull Request Guidelines

Recent commits use short, action-oriented subjects (for example, `Enhance parking management features`). Use a concise imperative summary that identifies the change; avoid vague messages such as `Fix Bugs`.

PRs should explain the user-visible and data-flow impact, list validation performed, link any issue when available, and include screenshots or a short recording for UI changes. Do not include secrets, tokens, or device-specific API URLs.

## Configuration and Security

Keep Firebase and API settings in ignored `.env` files using `EXPO_PUBLIC_*` variables. Set `EXPO_PUBLIC_API_BASE_URL` for the emulator, simulator, or device being used; do not hard-code a local network address in new code. These values are client-visible, so never place server secrets in them.
