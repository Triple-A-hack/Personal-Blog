# Blog API

Express + TypeScript + Drizzle ORM + PostgreSQL REST API.

## Setup
```bash
npm install
cp .env.example .env        # set DATABASE_URL and a 32+ char JWT_SECRET
npm run db:migrate          # applies the SQL in ./drizzle
npm run db:seed             # creates an ADMIN user from SEED_* env vars
npm run dev
```

## Response format
Success: `{ "success": true, "data": ... }`
Error:   `{ "success": false, "error": { "message": "...", "details": ... } }`

## Endpoints
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/register | public (creates READER) |
| POST | /api/auth/login | public |
| GET | /api/posts?page&limit&category&tag&search | public (PUBLISHED only) |
| GET | /api/posts/:slug | public; drafts visible to owner/admin |
| POST | /api/posts | ADMIN, AUTHOR |
| PUT | /api/posts/:id | ADMIN, or AUTHOR who owns the post |
| DELETE | /api/posts/:id | ADMIN, or AUTHOR who owns the post |
| GET | /api/posts/:postId/comments | public (threaded tree) |
| POST | /api/posts/:postId/comments | READER, AUTHOR, ADMIN |
| GET/POST | /api/categories, /api/tags | GET public, POST ADMIN |

Send `Authorization: Bearer <token>` for protected routes.
