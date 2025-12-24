## QUIZWIZ

Node.js + Express quiz app with SQLite, REST APIs, EJS views, and a CLI.

### Run locally

1. Copy env: `cp .env.example .env` (or create manually on Windows)
2. Install: `npm install`
3. Build: `npm run build`
4. Seed DB: `npm run seed`
5. Start dev: `npm run dev` (or `npm start` after build)

### Scripts
- `dev`: start nodemon with `src/server.ts`
- `build`: compile TypeScript
- `start`: run compiled server
- `seed`: run compiled seeder

### Endpoints
- `GET /` home with categories and recent quizzes
- `GET /api/quizzes` list (optional `?category=slug`)
- `GET /api/quizzes/:id` quiz detail with questions
- `POST /api/quizzes/:id/submit` submit answers

### Tech
- Express 5, EJS, Bootstrap, better-sqlite3
- Error handling, sessions, compression, helmet, morgan
- CommonJS + ESM interop example in `src/modules`

### Database configuration
- The app reads `MONGODB_URI` from the environment (recommended) and falls back to a local SQLite or `mongodb://127.0.0.1:27017/quizwiz` for development.

- Recommended setup for deployment (Render, Heroku, etc.):
  1. Add `MONGODB_URI` as a secret / environment variable in your hosting dashboard.
  2. Set your MongoDB Atlas network access rules to allow your host (or temporarily `0.0.0.0/0` for testing).
  3. If you encounter TLS handshake errors on the host, you can temporarily set `MONGO_TLS_INSECURE=true` to diagnose. **Do not** leave it enabled in production.

- See `.env.example` for sample variables and debug options.

Login issues or connection failures usually indicate either a wrong connection string, Atlas IP access rules blocking the host, or TLS mismatch; check the app logs for recommended troubleshooting steps.





