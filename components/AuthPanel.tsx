"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PublicUser } from "@/lib/auth/session";

type AuthMode = "login" | "register";
type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

export function AuthPanel({ user }: { user: PublicUser | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [state, setState] = useState<FormState>({ kind: "idle" });

  if (user) {
    return <SignedInPanel user={user} onLogout={() => handleLogout(router)} />;
  }

  return (
    <form
      onSubmit={(event) => handleSubmit(event, mode, setState, router)}
      className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 sm:min-w-80"
    >
      <div className="grid grid-cols-2 rounded-md bg-[var(--color-surface-2)] p-1 text-xs">
        <ModeButton active={mode === "login"} onClick={() => setMode("login")}>
          ログイン
        </ModeButton>
        <ModeButton
          active={mode === "register"}
          onClick={() => setMode("register")}
        >
          登録
        </ModeButton>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="メール"
          className={inputClass}
        />
        <input
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
          placeholder="パスワード"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={state.kind === "submitting"}
          className="h-9 rounded-md bg-[var(--color-text)] px-4 text-xs font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {mode === "login" ? "入る" : "作成"}
        </button>
      </div>
      {state.kind === "error" && (
        <p className="px-1 text-xs text-rose-700">{state.message}</p>
      )}
    </form>
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

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 rounded px-2 font-medium transition-colors ${
        active
          ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
          : "text-[var(--color-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  mode: AuthMode,
  setState: (state: FormState) => void,
  router: ReturnType<typeof useRouter>,
) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = {
    email: String(form.get("email") ?? ""),
    password: String(form.get("password") ?? ""),
  };
  setState({ kind: "submitting" });
  const result = await postJson(`/api/auth/${mode}`, payload);
  if (!result.ok) {
    setState({ kind: "error", message: result.error });
    return;
  }
  setState({ kind: "idle" });
  router.refresh();
}

async function handleLogout(router: ReturnType<typeof useRouter>) {
  await fetch("/api/auth/logout", { method: "POST" });
  router.refresh();
}

async function postJson(
  url: string,
  payload: { email: string; password: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch(url, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (response.ok) return { ok: true };
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  return { ok: false, error: body.error ?? "処理に失敗しました" };
}

const inputClass =
  "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-xs text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-text)]";
