import {
  type Asset,
  ASSET_TYPE_LABELS,
  EQUITY_LABELS,
  STAGE_LABELS,
  TIMING_LABELS,
} from "@/lib/types";

const equityTone: Record<Asset["equity"], string> = {
  none: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  optional: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  required: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <a
      href={asset.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-xl border bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
            {asset.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
            {asset.operator}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${equityTone[asset.equity]}`}
        >
          {EQUITY_LABELS[asset.equity]}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-[var(--color-muted)]">
        {asset.summary}
      </p>

      {asset.value && (
        <div className="rounded-lg border border-[var(--color-accent)]/25 bg-[var(--color-accent-soft)]/40 px-3 py-2 text-sm font-medium text-[var(--color-text)]">
          {asset.value}
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {asset.assetTypes.map((t) => (
          <span
            key={t}
            className="rounded-md bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] text-[var(--color-text)]"
          >
            {ASSET_TYPE_LABELS[t]}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--color-border)] pt-3 text-[11px] text-[var(--color-muted)]">
        <span>
          <span className="text-[var(--color-text)]">フェーズ:</span>{" "}
          {asset.stages.map((s) => STAGE_LABELS[s]).join(" / ")}
        </span>
        <span>
          <span className="text-[var(--color-text)]">申込:</span>{" "}
          {TIMING_LABELS[asset.timingType]}（{asset.timing}）
        </span>
      </div>
    </a>
  );
}
