# ScholarStack (AI Studio App)

ScholarStack is a premium-style learning platform prototype for advanced computer science education.  
It combines a React single-page app, Firebase auth/data storage, and a Gemini-powered "Scholar Assistant" chat experience.

Live app in AI Studio: https://ai.studio/apps/2a48385e-8478-422a-b720-d9db1c8b87da

## What this app does

- Presents an editorial course platform with landing, catalog, lesson, library, and dashboard views.
- Supports Google sign-in and stores user profile/progress in Firestore.
- Provides an in-app AI assistant (Gemini) with per-user chat history stored in Firestore.
- Includes a code workspace view that saves drafts to Firestore by course/project.

## Tech stack

- **Frontend:** React 19, React Router 7, Motion, Tailwind CSS 4, Lucide icons
- **Backend (dev/prod serving):** Express + Vite middleware (`server.ts`)
- **AI:** `@google/genai` (Gemini API)
- **Data/Auth:** Firebase Auth + Firestore
- **Language/tooling:** TypeScript, Vite, tsx

## Project structure (where to go)

### Core app files

- `src/App.tsx` - Main app shell, auth context, routes, page components, and AI assistant UI/logic.
- `src/constants.ts` - Static seed/demo data (courses, achievements, live sessions, resources).
- `src/types.ts` - Shared TypeScript types for app data.
- `src/firebase.ts` - Firebase initialization and Firestore/Auth setup.
- `src/index.css` - Global styles and design tokens.
- `src/main.tsx` - React entry point.
- `src/lib/utils.ts` - Shared utility helpers (e.g., className merge helper).

### Runtime and config

- `server.ts` - Express server for local runtime; mounts Vite in dev and serves `dist` in production.
- `vite.config.ts` - Vite configuration.
- `tsconfig.json` - TypeScript compiler options.
- `package.json` - Scripts and dependencies.
- `.env.example` - Environment variable template.

### Firebase and platform files

- `firebase-applet-config.json` - Firebase project/app configuration used at runtime.
- `firestore.rules` - Firestore security rules.
- `firebase-blueprint.json` - Firebase blueprint metadata.
- `metadata.json` - AI Studio metadata.

### Documentation

- `doc/DESIGN.md` - Visual/design system guidance ("Architectural Scholar" theme and UI rules).

## Routes and feature map

The app currently defines these routes in `src/App.tsx`:

- `/` - Landing page
- `/dashboard` - Progress dashboard
- `/catalog` - Course catalog
- `/library` - Resource library/search
- `/lesson/:id` - Lesson detail page
- `/workspace` and `/workspace/:courseId` - Code workspace
- `/modules` - Alias to dashboard

If you want to update navigation or add/remove pages, start in `src/App.tsx` (router + sidebar/header links).

## Data model overview (Firestore)

The UI expects data under:

- `users/{uid}` - user profile + course progress map
- `users/{uid}/chat_history/*` - Scholar Assistant chat messages
- `users/{uid}/workspace/{courseId}` - saved code drafts per workspace

Most reads/writes are performed directly inside `src/App.tsx` page/component logic.

## Contributor quick start

If this is your first time in the repo, follow this sequence:

1. Read `doc/DESIGN.md` to understand the design language and UI rules.
2. Skim `src/App.tsx` to see routing, page composition, auth, and Firestore usage.
3. Review `src/constants.ts` and `src/types.ts` to understand the demo data shape.
4. Run the app locally and click through all routes once.
5. Make a small, focused change first (copy tweak, style tweak, or one route-level UI improvement).

## Local development

### Prerequisites

- Node.js 20+ recommended
- A valid Firebase config in `firebase-applet-config.json`
- A Gemini API key

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` (or `.env`) from `.env.example` and set:
   - `GEMINI_API_KEY`
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

## First-day contributor map

Use this table when deciding where to implement a change:

| If you want to... | Start here |
|---|---|
| Add or modify a page/route | `src/App.tsx` |
| Update navigation links or layout shell | `src/App.tsx` (`Sidebar`, `Header`, route definitions) |
| Change sample courses/resources content | `src/constants.ts` |
| Change shared data shapes | `src/types.ts` |
| Update Firebase setup | `src/firebase.ts` |
| Adjust app look-and-feel/tokens | `src/index.css` + `doc/DESIGN.md` |
| Add backend endpoint(s) | `server.ts` |

## Scripts

- `npm run dev` - Start Express + Vite middleware at `localhost:3000`
- `npm run build` - Build production assets with Vite
- `npm run preview` - Preview the built app
- `npm run lint` - Type-check with `tsc --noEmit`
- `npm run clean` - Remove `dist`

## Build and production run

1. Build:
   ```bash
   npm run build
   ```
2. Start server in production mode:
   ```bash
   NODE_ENV=production node server.ts
   ```

The server will serve static files from `dist/`.

## Common editing workflows

- **Change page UI/content:** edit relevant page component in `src/App.tsx`.
- **Change demo catalog/library content:** edit `src/constants.ts`.
- **Adjust styles/tokens:** edit `src/index.css` and reference `doc/DESIGN.md`.
- **Adjust auth/firestore behavior:** edit Firebase logic in `src/App.tsx` and setup in `src/firebase.ts`.
- **Add API routes:** add routes to `server.ts` before Vite middleware/static serving.

## Contributor workflow

1. Create a branch for your change.
2. Make focused edits in the smallest relevant file(s).
3. Run:
   ```bash
   npm run lint
   npm run build
   ```
4. Manually test the route(s) you touched.
5. Open a PR with:
   - what changed
   - why it changed
   - how to test it

## Manual QA checklist (for UI changes)

- Verify the changed route renders without console/runtime errors.
- Verify sign-in/sign-out still works if your change touched auth-adjacent UI.
- Verify responsive behavior at mobile and desktop widths.
- Verify no obvious design regressions against `doc/DESIGN.md` principles.

## Troubleshooting

- If Gemini chat fails, confirm `GEMINI_API_KEY` is present in your env file.
- If data/auth calls fail, verify Firebase values in `firebase-applet-config.json` and Firestore rules.
- If the app does not load, check the dev server logs and confirm port `3000` is free.
