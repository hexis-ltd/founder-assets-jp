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
  const pipelineStats = getPipelineStats(userStates);

  return (
    <main className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/86 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
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

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.5fr)] lg:items-end">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase text-[var(--color-muted)]">
            startup support command center
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight text-[var(--color-text)] sm:text-5xl">
            支援アセットを探して、申請状況まで一気に管理。
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
            無料オフィス、クラウドクレジット、補助金、アクセラレーター、人材育成、海外展開まで。
            日本のスタートアップ向け支援を、応募可否・フェーズ・エクイティ・自分の進捗で整理できます。
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
              {user ? `${user.email} のワークスペース` : "ログインで進捗保存"}
            </span>
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5">
              締切順に自動整理
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
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
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-2">
            {pipelineStats.map((stat) => (
              <div key={stat.label} className="px-2 py-2">
                <div className="text-sm font-semibold text-[var(--color-text)]">
                  {stat.value}
                </div>
                <div className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
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

function getPipelineStats(
  states: Awaited<ReturnType<typeof getUserAssetStates>>,
) {
  const count = (status: string) =>
    states.filter((state) => state.status === status).length;
  return [
    { label: "気になる", value: `${count("interested")}` },
    { label: "申請予定", value: `${count("planned")}` },
    { label: "申請済み", value: `${count("applied")}` },
  ];
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
