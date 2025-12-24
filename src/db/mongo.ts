import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let database: Db | null = null;

export async function initMongo(): Promise<Db> {
  if (database) return database;
  // Using MongoDB Atlas directly (credentials hardcoded here as requested).
  // WARNING: Hardcoding credentials is insecure for production — prefer environment variables or a secrets manager.
  const uri = 'mongodb+srv://amitsaini5865_db_user:123456789@quizwiz.tu5ad7r.mongodb.net/quizwiz?retryWrites=true&w=majority&appName=QuizWiz';
  client = new MongoClient(uri);
  await client.connect();
  const dbNameFromUri = (() => {
    try {
      const url = new URL(uri);
      const pathname = url.pathname.replace(/^\//, '');;
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


