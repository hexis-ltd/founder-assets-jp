import { neon } from "@neondatabase/serverless";

type SqlClient = ReturnType<typeof neon>;

let cachedSql: SqlClient | null | undefined;

export function getSql(): SqlClient | null {
  if (cachedSql !== undefined) return cachedSql;
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  cachedSql = databaseUrl ? neon(databaseUrl) : null;
  return cachedSql;
}

export function requireSql(): SqlClient {
  const sql = getSql();
  if (!sql) {
    throw new Error("DATABASE_URL is required for this operation");
  }
  return sql;
}
