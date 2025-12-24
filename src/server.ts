import 'dotenv/config';
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import ejsMate from 'ejs-mate';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { fileURLToPath } from 'url';
import createError from './utils/createError.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.js';
import router from './routes/index.js';
import { initMongo } from './db/mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.engine('ejs', ejsMate as any);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", 'data:']
      }
    }
  } as any)
);
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizwiz', ttl: 60 * 60 }),
    cookie: { secure: false, httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 },
  })
);

app.use(express.static(path.join(__dirname, 'public')));

// expose session to views
app.use((req, _res, next) => {
  (req as any).app.locals.session = req.session;
  next();
});

app.use('/', router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = Number(process.env.PORT || 3000);
initMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`QUIZWIZ server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

export default app;

