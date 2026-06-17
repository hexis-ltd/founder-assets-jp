import { requireSql } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { PublicUser } from "@/lib/auth/session";

type UserWithPasswordRow = PublicUser & {
  password_hash: string | null;
};

type UserWithGoogleRow = PublicUser & {
  google_sub: string | null;
};

export async function createUserWithPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<PublicUser> {
  const sql = requireSql();
  const passwordHash = await hashPassword(password);
  const rows = (await sql`
    insert into users (email, password_hash)
    values (${email}, ${passwordHash})
    returning id, email
  `) as PublicUser[];
  return rows[0];
}

export async function verifyUserPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<PublicUser | null> {
  const sql = requireSql();
  const rows = (await sql`
    select id, email, password_hash
    from users
    where email = ${email}
    limit 1
  `) as UserWithPasswordRow[];
  const user = rows[0];
  if (!user) return null;
  if (!user.password_hash) return null;
  const valid = await verifyPassword(password, user.password_hash);
  return valid ? { id: user.id, email: user.email } : null;
}

export async function findOrCreateGoogleUser({
  email,
  googleSub,
  name,
  picture,
}: {
  email: string;
  googleSub: string;
  name?: string;
  picture?: string;
}): Promise<PublicUser> {
  const linkedUser = await findUserByGoogleSub(googleSub);
  if (linkedUser) return linkedUser;

  const emailUser = await findUserByEmail(email);
  if (emailUser) {
    if (emailUser.google_sub && emailUser.google_sub !== googleSub) {
      throw new Error("GOOGLE_ACCOUNT_CONFLICT");
    }
    return linkGoogleUser({ googleSub, id: emailUser.id, name, picture });
  }

  return createGoogleUser({ email, googleSub, name, picture });
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function findUserByGoogleSub(
  googleSub: string,
): Promise<PublicUser | null> {
  const sql = requireSql();
  const rows = (await sql`
    select id, email
    from users
    where google_sub = ${googleSub}
    limit 1
  `) as PublicUser[];
  return rows[0] ?? null;
}

async function findUserByEmail(email: string): Promise<UserWithGoogleRow | null> {
  const sql = requireSql();
  const rows = (await sql`
    select id, email, google_sub
    from users
    where email = ${email}
    limit 1
  `) as UserWithGoogleRow[];
  return rows[0] ?? null;
}

async function linkGoogleUser({
  googleSub,
  id,
  name,
  picture,
}: {
  googleSub: string;
  id: string;
  name?: string;
  picture?: string;
}): Promise<PublicUser> {
  const sql = requireSql();
  const rows = (await sql`
    update users
    set google_sub = ${googleSub},
        name = ${name ?? null},
        picture = ${picture ?? null}
    where id = ${id}
    returning id, email
  `) as PublicUser[];
  return rows[0];
}

async function createGoogleUser({
  email,
  googleSub,
  name,
  picture,
}: {
  email: string;
  googleSub: string;
  name?: string;
  picture?: string;
}): Promise<PublicUser> {
  const sql = requireSql();
  const rows = (await sql`
    insert into users (email, google_sub, name, picture)
    values (${email}, ${googleSub}, ${name ?? null}, ${picture ?? null})
    returning id, email
  `) as PublicUser[];
  return rows[0];
}
