# Inkwell: Blog Client

React 18 + Vite + TypeScript (strict) + Tailwind + React Query + React Router + Tiptap.

## Run
```bash
npm install
cp .env.example .env      # VITE_API_URL defaults to http://localhost:5000/api
npm run dev               # http://localhost:5173
npm run build             # typecheck + production build
```
The backend must be running on the URL in `VITE_API_URL` (the backend's `.env.example` now uses `PORT=5000`).
Backend CORS defaults to `*`; in production set `CORS_ORIGIN` to your client's origin.

## Routes
| Path | Access |
|---|---|
| `/` | public: feed, category tabs, tag filter, `?search=`, pagination |
| `/posts/:slug` | public: post + threaded comments |
| `/login`, `/register` | public |
| `/admin/posts` | ADMIN, AUTHOR |
| `/admin/posts/new`, `/admin/posts/:slug/edit` | ADMIN, AUTHOR |
| `/admin/categories`, `/admin/tags` | ADMIN, AUTHOR (view); ADMIN (create) |
| `/admin/settings` | ADMIN, AUTHOR |

## Layout
- `src/services`: axios client (JWT interceptor, error normalisation, 401 handling) and typed API functions
- `src/hooks/queries.ts`: every `useQuery`/`useMutation` plus query-key invalidation
- `src/context`: Auth, Theme, Toast, QueryProvider (global mutation error toasts)
- `src/components`: `ui/` primitives, `layout/`, `posts/`, `comments/`, `editor/`, `admin/`
