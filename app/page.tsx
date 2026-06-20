import { Directory } from "@/components/Directory";
import { AuthPanel } from "@/components/AuthPanel";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssets, getUserAssetStates } from "@/lib/db/assets";
import Link from "next/link";

const REPO_URL = "https://github.com/hexis-ltd/founder-assets-jp";

export default async function Home() {
  const assets = await getAssets();
  const user = await getCurrentUser();
  const userStates = user ? await getUserAssetStates(user.id) : [];

  return (
    <main className="min-h-dvh">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Founder Assets JP
          </Link>
          <nav className="flex items-center gap-2">
            <a
              href="https://hexis.ltd"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center rounded-full px-3 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] sm:inline-flex"
            >
              Hexis
            </a>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center rounded-full px-3 text-sm text-[var(--color-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] sm:inline-flex"
            >
              GitHub
            </a>
            <AuthPanel user={user} />
          </nav>
        </div>
      </header>

      <section id="directory" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Directory assets={assets} initialStates={userStates} user={user} />
      </section>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs leading-relaxed text-[var(--color-muted)] sm:px-6">
          <p>
            掲載情報は各公式サイトの公開情報を基にしたキュレーションです。金額・募集時期・応募条件などは変動するため、
            <span className="text-[var(--color-text)]">
              最終的な内容は必ず各プログラムの公式サイトでご確認ください
            </span>
            。
          </p>
          <p>
            誤りの指摘やプログラムの追加は{" "}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-text)] underline decoration-dotted underline-offset-4"
            >
              GitHub の Pull Request
            </a>{" "}
            で歓迎します。Built by Hexis. MIT License.
          </p>
        </div>
      </footer>
    </main>
  );
}
