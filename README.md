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

### Database configuration ⚠️
The app is configured to use a MongoDB Atlas URI hardcoded into the server and DB client files (session store and `src/db/mongo.ts`). **This includes credentials** and is insecure for production. Prefer setting `MONGODB_URI` via environment variables or a proper secrets manager and updating `src/db/mongo.ts` and `src/server.ts` accordingly.





