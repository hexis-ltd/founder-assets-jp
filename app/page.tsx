import { Directory } from "@/components/Directory";
import { AuthPanel } from "@/components/AuthPanel";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssets, getUserAssetStates } from "@/lib/db/assets";
import { LAST_CHECKED } from "@/lib/data";

const REPO_URL = "https://github.com/hexis-ltd/founder-assets-jp";

export default async function Home() {
  const assets = await getAssets();
  const user = await getCurrentUser();
  const userStates = user ? await getUserAssetStates(user.id) : [];
  const stats = getStats(assets);

  return (
    <main className="min-h-dvh">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="/" className="text-sm font-semibold tracking-tight">
            Founder Assets JP
          </a>
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

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-muted)]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--color-text)] opacity-40" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[var(--color-text)]" />
            </span>
            {LAST_CHECKED}更新 · 日本の起業家向け
          </div>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--color-text)] sm:text-5xl">
            起業に使える支援を、
            <br className="hidden sm:block" />
            ひとつのリストに。
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[var(--color-muted)]">
            無料オフィス・クラウドクレジット・補助金・アクセラレーター・人材育成・海外展開——
            日本の起業家が応募できる支援を、フェーズ・エクイティ・募集状況で横断検索できます。
          </p>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--color-surface)] px-4 py-4 sm:px-5 sm:py-5"
            >
              <dd className="text-3xl font-semibold tabular-nums leading-none tracking-tight text-[var(--color-text)] sm:text-4xl">
                {stat.value}
              </dd>
              <dt className="mt-2 text-xs text-[var(--color-muted)]">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
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

function getStats(assets: Awaited<ReturnType<typeof getAssets>>) {
  const nonEquityCount = assets.filter(
    (asset) => asset.equity === "none",
  ).length;
  const rollingCount = assets.filter(
    (asset) => asset.application.status === "rolling",
  ).length;
  const cloudCount = assets.filter((asset) =>
    asset.assetTypes.includes("cloud-credit"),
  ).length;
  return [
    { label: "掲載アセット", value: `${assets.length}` },
    { label: "非エクイティ", value: `${nonEquityCount}` },
    { label: "通年募集", value: `${rollingCount}` },
    { label: "クラウド支援", value: `${cloudCount}` },
  ];
}
