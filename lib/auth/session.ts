import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getSql, requireSql } from "@/lib/db/client";

const SESSION_COOKIE = "founder_assets_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type PublicUser = {
  id: string;
  email: string;
};

type UserRow = {
  id: string;
  email: string;
};

export async function getCurrentUser(): Promise<PublicUser | null> {
  const sql = getSql();
  const token = await getSessionToken();
  if (!sql || !token) return null;
  const rows = (await sql`
    select u.id, u.email
    from user_sessions s
    join users u on u.id = s.user_id
    where s.token_hash = ${hashSessionToken(token)}
      and s.expires_at > now()
    limit 1
  `) as UserRow[];
  return rows[0] ?? null;
}

export async function createSession(userId: string): Promise<void> {
  const sql = requireSql();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await sql`
    insert into user_sessions (user_id, token_hash, expires_at)
    values (${userId}, ${hashSessionToken(token)}, ${expiresAt.toISOString()})
  `;
  await setSessionCookie(token);
}

export async function deleteCurrentSession(): Promise<void> {
  const sql = getSql();
  const token = await getSessionToken();
  if (sql && token) {
    await sql`delete from user_sessions where token_hash = ${hashSessionToken(token)}`;
  }
  await clearSessionCookie();
}

async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}
