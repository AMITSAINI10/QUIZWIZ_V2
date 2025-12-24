import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let database: Db | null = null;

export async function initMongo(): Promise<Db> {
  if (database) return database;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizwiz';
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


