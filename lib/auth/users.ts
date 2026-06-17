import { requireSql } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { PublicUser } from "@/lib/auth/session";

type UserWithPasswordRow = PublicUser & {
  password_hash: string;
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
  const valid = await verifyPassword(password, user.password_hash);
  return valid ? { id: user.id, email: user.email } : null;
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
