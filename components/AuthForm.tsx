"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type AuthMode = "signin" | "signup";
type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

const modeConfig: Record<
  AuthMode,
  {
    alternateHref: string;
    alternateLabel: string;
    alternateText: string;
    apiPath: string;
    cta: string;
    passwordAutocomplete: "current-password" | "new-password";
    subtitle: string;
    title: string;
  }
> = {
  signin: {
    alternateHref: "/signup",
    alternateLabel: "アカウントを作成",
    alternateText: "はじめて使いますか？",
    apiPath: "/api/auth/login",
    cta: "サインイン",
    passwordAutocomplete: "current-password",
    subtitle: "保存した申請状態を読み込みます。",
    title: "サインイン",
  },
  signup: {
    alternateHref: "/signin",
    alternateLabel: "サインイン",
    alternateText: "すでにアカウントがありますか？",
    apiPath: "/api/auth/register",
    cta: "アカウント作成",
    passwordAutocomplete: "new-password",
    subtitle: "アセットごとの進捗を自分用に保存できます。",
    title: "サインアップ",
  },
};

export function AuthForm({
  initialErrorMessage,
  mode,
}: {
  initialErrorMessage?: string;
  mode: AuthMode;
}) {
  const config = modeConfig[mode];
  const router = useRouter();
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const errorMessage =
    state.kind === "error" ? state.message : initialErrorMessage;

  return (
    <form
      onSubmit={(event) =>
        handleSubmit(event, config.apiPath, setState, router)
      }
      className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_28px_80px_-64px_rgb(0_0_0/0.7)]"
    >
      <div>
        <Link
          href="/"
          className="text-xs font-medium uppercase text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          Founder Assets JP
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          {config.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {config.subtitle}
        </p>
      </div>

      <a
        href="/api/auth/google/start"
        className="flex h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-text)]"
      >
        Googleで続行
      </a>

      <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span>またはメールで続行</span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <div className="grid gap-3">
        <Field label="メール">
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="パスワード">
          <input
            name="password"
            type="password"
            autoComplete={config.passwordAutocomplete}
            required
            minLength={8}
            className={inputClass}
            placeholder="8文字以上"
          />
        </Field>
      </div>

      {errorMessage && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={state.kind === "submitting"}
        className="h-11 rounded-full bg-[var(--color-text)] px-5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {state.kind === "submitting" ? "送信中..." : config.cta}
      </button>

      <p className="text-center text-sm text-[var(--color-muted)]">
        {config.alternateText}{" "}
        <Link
          href={config.alternateHref}
          className="font-medium text-[var(--color-text)] underline decoration-dotted underline-offset-4"
        >
          {config.alternateLabel}
        </Link>
      </p>
    </form>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[var(--color-text)]">
      {label}
      {children}
    </label>
  );
}

async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  apiPath: string,
  setState: (state: FormState) => void,
  router: ReturnType<typeof useRouter>,
) {
  event.preventDefault();
  setState({ kind: "submitting" });
  const result = await postAuth(apiPath, new FormData(event.currentTarget));
  if (!result.ok) {
    setState({ kind: "error", message: result.error });
    return;
  }
  setState({ kind: "idle" });
  router.push("/");
  router.refresh();
}

async function postAuth(
  apiPath: string,
  form: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch(apiPath, {
    body: JSON.stringify({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  if (response.ok) return { ok: true };
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  return { ok: false, error: body.error ?? "処理に失敗しました" };
}

const inputClass =
  "h-11 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-text)]";
