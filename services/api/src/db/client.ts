import { Pool, type PoolClient, type QueryResult } from "pg";

import { getEnv } from "../config/env.js";

export type DatabaseExecutor = Pick<PoolClient, "query">;

let pool: Pool | null = null;

function buildPool() {
  const { postgresUrl } = getEnv();

  if (!postgresUrl) {
    return null;
  }

  return new Pool({
    connectionString: postgresUrl
  });
}

export function getPool() {
  if (!pool) {
    pool = buildPool();
  }

  return pool;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  values: unknown[] = []
): Promise<QueryResult<T> | null> {
  const activePool = getPool();

  if (!activePool) {
    return null;
  }

  return activePool.query<T>(text, values);
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const activePool = getPool();

  if (!activePool) {
    throw new Error("POSTGRES_URL is not configured.");
  }

  const client = await activePool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}
