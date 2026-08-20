import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Schema init — runs once per process, cross-process safe via advisory lock.
let ready: Promise<void> | undefined;

export function ensureReady(): Promise<void> {
  return (ready ??= init());
}

async function init(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(1)");
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id        SERIAL PRIMARY KEY,
        title     VARCHAR(255) NOT NULL,
        completed BOOLEAN      NOT NULL DEFAULT FALSE
      )
    `);
  } finally {
    await client.query("SELECT pg_advisory_unlock(1)");
    client.release();
  }
}
