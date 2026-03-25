# AGENTS.md

## Cursor Cloud specific instructions

### Overview

ScholarStack is a single-service React + Express learning platform prototype. There is one Express server (`server.ts`) that serves the Vite-powered React SPA in dev mode on port 3000.

### Commands

All standard commands are in `package.json`:

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (Express + Vite on port 3000) |
| Lint / type-check | `npm run lint` (`tsc --noEmit`) |
| Build | `npm run build` (Vite production build) |
| Health check | `curl http://localhost:3000/api/health` |

### Environment variables

Copy `.env.example` to `.env`. Only `GEMINI_API_KEY` is needed; the app runs and navigates without it — only the AI "Scholar Assistant" chat feature requires it. Firebase config is hardcoded in `firebase-applet-config.json`.

### Caveats

- There is **no test framework** in this project — no unit or integration tests exist. `npm run lint` (TypeScript type-check) is the only automated validation.
- The project uses `npm` (lockfile is `package-lock.json`).
- The dev server binds to `0.0.0.0:3000`.
- Google sign-in and Firestore require network access to Firebase cloud services. The app renders all routes without auth, but user-specific features (progress, chat history, workspace saves) require signing in.
- The workspace code editor and "Run Tests" / "Save Draft" buttons are UI-only when not signed in — Firestore writes require auth. The editor is still interactive for local edits.
- If `.env` does not exist, create it from `.env.example`. `GEMINI_API_KEY` can be left empty for all non-AI-chat work.
