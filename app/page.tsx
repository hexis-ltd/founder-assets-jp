import { Directory } from "@/components/Directory";
import { assets } from "@/lib/data";

const REPO_URL = "https://github.com/hexis-ltd/founder-assets-jp";

export default function Home() {
  const count = assets.length;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {/* ヘッダー */}
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            Founder Assets JP
          </span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
          >
            GitHub で貢献する ↗
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            起業家アセット図鑑
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
            日本のスタートアップ・起業家が使える支援アセットを 1
            か所に集約。無料オフィス・クラウドクレジット・アクセラレーター・補助金・人材育成・海外展開までを、
            <span className="text-[var(--color-text)]">
              提供アセット種別 / 対象フェーズ / エクイティ有無 / 申込時期
            </span>
            の4軸で横断検索できます。現在
            <span className="text-[var(--color-text)]"> {count} 件</span>
            を掲載。
          </p>
        </div>
      </header>

      {/* 本体 */}
      <section className="mt-10">
        <Directory />
      </section>

      {/* フッター */}
      <footer className="mt-16 flex flex-col gap-3 border-t border-[var(--color-border)] pt-8 text-xs leading-relaxed text-[var(--color-muted)]">
        <p>
          掲載情報は各公式サイトの公開情報を基にしたキュレーションです。金額・募集時期・応募条件などは変動するため、
          <span className="text-[var(--color-text)]">
            最終的な内容は必ず各プログラムの公式サイトでご確認ください
          </span>
          。誤りの指摘やプログラムの追加は{" "}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-[var(--color-text)]"
          >
            GitHub の Pull Request
          </a>{" "}
          で歓迎します。
        </p>
        <p>
          Built by{" "}
          <a
            href="https://hexis.ltd"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-[var(--color-text)]"
          >
            Hexis
          </a>
          . オープンソース（MIT License）。
        </p>
      </footer>
    </main>
  );
}
