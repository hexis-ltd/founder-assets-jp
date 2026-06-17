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

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="max-w-3xl">
          <p className="text-xs font-medium text-[var(--color-muted)]">
            Startup support directory
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[var(--color-text)] sm:text-4xl">
            起業家向け支援アセット
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            無料オフィス、クラウドクレジット、補助金、アクセラレーター、人材育成、海外展開まで。
            日本のスタートアップ向け支援を、応募可否・フェーズ・エクイティで整理します。
          </p>
        </div>
        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-[var(--color-border)] py-3 text-sm">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <dt className="text-[var(--color-muted)]">{stat.label}</dt>
              <dd className="font-medium text-[var(--color-text)]">
                {stat.value}
              </dd>
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
    { label: "掲載", value: `${assets.length}` },
    { label: "非エクイティ", value: `${nonEquityCount}` },
    { label: "通年", value: `${rollingCount}` },
    { label: "クラウド", value: `${cloudCount}` },
  ];
}
