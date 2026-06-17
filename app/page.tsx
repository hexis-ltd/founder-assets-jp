import { Directory } from "@/components/Directory";
import { AuthPanel } from "@/components/AuthPanel";
import { getCurrentUser } from "@/lib/auth/session";
import { getAssets, getUserAssetStates } from "@/lib/db/assets";

const REPO_URL = "https://github.com/hexis-ltd/founder-assets-jp";

export default async function Home() {
  const assets = await getAssets();
  const user = await getCurrentUser();
  const userStates = user ? await getUserAssetStates(user.id) : [];
  const stats = getStats(assets);

  return (
    <main className="min-h-dvh">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/82 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
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
              className="inline-flex h-9 items-center rounded-full bg-[var(--color-text)] px-4 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90"
            >
              GitHub で貢献
            </a>
          </nav>
        </div>
        <div className="mx-auto flex max-w-7xl justify-end px-4 pb-4 sm:px-6">
          <AuthPanel user={user} />
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.55fr)] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-[var(--color-muted)]">
            startup support asset directory
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
            起業家が使える支援を、応募しやすい順に。
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
            無料オフィス、クラウドクレジット、補助金、アクセラレーター、人材育成、海外展開まで。
            日本のスタートアップ向けアセットを、提供内容・フェーズ・エクイティ・募集ステータスで横断検索できます。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[0_28px_80px_-64px_rgb(0_0_0/0.7)]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-md bg-[var(--color-surface-2)] px-4 py-3"
            >
              <div className="text-2xl font-semibold text-[var(--color-text)]">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-[var(--color-muted)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <Directory assets={assets} initialStates={userStates} user={user} />
      </section>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs leading-relaxed text-[var(--color-muted)] sm:px-6">
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
    { label: "通年・随時", value: `${rollingCount}` },
    { label: "クラウド特典", value: `${cloudCount}` },
  ];
}
