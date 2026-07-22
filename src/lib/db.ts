import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const sql = databaseUrl ? neon(databaseUrl) : null;

export async function initDbTables() {
  if (!sql) {
    console.log('No DATABASE_URL found. Running in client/storage fallback mode.');
    return false;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lab_settings (
        id INT PRIMARY KEY DEFAULT 1,
        content JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lab_collections (
        collection_name VARCHAR(100) PRIMARY KEY,
        items JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Vercel Postgres tables initialized successfully!');
    return true;
  } catch (error) {
    console.error('Failed to initialize Vercel Postgres tables:', error);
    return false;
  }
}
