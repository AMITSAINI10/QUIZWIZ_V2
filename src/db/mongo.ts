import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let database: Db | null = null;

export async function initMongo(): Promise<Db> {
  if (database) return database;

  // Use MONGODB_URI from environment (recommended) with sensible defaults and connection options
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizwiz';
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


