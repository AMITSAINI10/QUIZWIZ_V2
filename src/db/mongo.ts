import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let database: Db | null = null;

export async function initMongo(): Promise<Db> {
  if (database) return database;

  // Use MONGODB_URI from environment (recommended) with sensible defaults and connection options
  const rawUri = process.env.MONGODB_URI;
  let uri = rawUri || 'mongodb://127.0.0.1:27017/quizwiz';

  // Auto-fix common mistakes: extra "@@" and missing DB name in the path. Warn so the env can be corrected.
  if (rawUri) {
    if (rawUri.includes('@@')) {
      console.warn('Warning: MONGODB_URI contains "@@" — attempting to correct to a single "@". Please fix your environment variable.');
      uri = rawUri.replace(/@@/g, '@');
    }
    try {
      const parsed = new URL(uri);
      // If no DB name provided (e.g., path is '/' or empty) and it's a mongodb+srv, append default DB name 'quizwiz'
      if ((uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) && (!parsed.pathname || parsed.pathname === '/')) {
        console.warn('Warning: MONGODB_URI has no database name in the path. Defaulting to database "quizwiz".');
        // preserve query string if present
        const query = parsed.search || '';
        uri = uri.replace(/(\?.*)?$/, '/quizwiz' + query);
      }
    } catch (e) {
      // If URL parsing fails, we'll let the MongoDB driver raise a parsing error later — but add a helpful log.
      console.warn('Could not parse MONGODB_URI for validation; it may be malformed. Error:', e);
    }
  }

  const tlsAllowInvalidCertificates = process.env.MONGO_TLS_INSECURE === 'true';
  const serverSelectionTimeoutMS = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000;

  const clientOptions = {
    serverSelectionTimeoutMS,
    // if the URI is mongodb+srv it will use TLS automatically
    tls: uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://'),
    tlsAllowInvalidCertificates,
  } as const;

  client = new MongoClient(uri, clientOptions);
  try {
    await client.connect();
  } catch (err) {
    console.error('Failed to connect to MongoDB. Verify MONGODB_URI, Atlas IP access list, and TLS settings. Error:');
    console.error(err);
    throw err;
  }

  // Log a redacted URI so we don't leak credentials into logs
  const redactedUri = (() => {
    try {
      const u = new URL(uri);
      if (u.username || u.password) {
        u.username = '***';
        u.password = '***';
      }
      return u.toString();
    } catch {
      return uri.replace(/:\/\/.*@/, '://***:***@');
    }
  })();
  console.log('Connected to MongoDB:', redactedUri);

  const dbNameFromUri = (() => {
    try {
      const url = new URL(uri);
      const pathname = url.pathname.replace(/^\//, '');
      return pathname || 'quizwiz';
    } catch {
      return 'quizwiz';
    }
  })();

  database = client.db(dbNameFromUri);
  return database;
} 
export function getDb(): Db {
  if (!database) throw new Error('MongoDB not initialized. Call initMongo() first.');
  return database;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}


