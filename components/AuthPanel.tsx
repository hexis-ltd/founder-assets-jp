"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/auth/session";

export function AuthPanel({ user }: { user: PublicUser | null }) {
  const router = useRouter();

  if (user) {
    return <SignedInPanel user={user} onLogout={() => handleLogout(router)} />;
  }

  return (
    <Link
      href="/signin"
      className="inline-flex h-9 items-center rounded-full bg-[var(--color-text)] px-4 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90"
    >
      サインイン
    </Link>
  );
}

function SignedInPanel({
  onLogout,
  user,
}: {
  onLogout: () => void;
  user: PublicUser;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1 pl-3 text-xs">
      <span className="max-w-40 truncate text-[var(--color-muted)]">
        {user.email}
      </span>
      <button
        type="button"
        onClick={onLogout}
        className="h-8 rounded-full bg-[var(--color-text)] px-3 font-medium text-[var(--color-bg)]"
      >
        ログアウト
      </button>
    </div>
  );
}

async function handleLogout(router: ReturnType<typeof useRouter>) {
  await fetch("/api/auth/logout", { method: "POST" });
  router.refresh();
}
