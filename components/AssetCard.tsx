import {
  type Asset,
  ASSET_TYPE_LABELS,
  EQUITY_LABELS,
  STAGE_LABELS,
  getStatusDisplay,
} from "@/lib/types";

const equityTone: Record<Asset["equity"], string> = {
  none: "border-emerald-200 bg-emerald-50 text-emerald-700",
  optional: "border-amber-200 bg-amber-50 text-amber-800",
  required: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusTone: Record<ReturnType<typeof getStatusDisplay>["tone"], string> =
  {
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rolling: "border-sky-200 bg-sky-50 text-sky-700",
    muted:
      "border-[var(--color-border)] bg-[var(--color-muted-soft)] text-[var(--color-muted)]",
  };

export function AssetCard({ asset, now }: { asset: Asset; now?: Date }) {
  const status = getStatusDisplay(asset.application, now);

  return (
    <a
      href={asset.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-[320px] flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_50px_-42px_rgb(0_0_0/0.55)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[var(--color-text)]/25 hover:shadow-[0_24px_60px_-44px_rgb(0_0_0/0.7)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[var(--color-muted)]">
            {asset.operator}
          </p>
          <h3 className="mt-1 text-base font-semibold leading-snug text-[var(--color-text)]">
            {asset.name}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${equityTone[asset.equity]}`}
        >
          {EQUITY_LABELS[asset.equity]}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
        {asset.summary}
      </p>

      {asset.value && (
        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5 text-sm font-medium leading-relaxed text-[var(--color-text)]">
          {asset.value}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {asset.assetTypes.slice(0, 3).map((type) => (
          <span
            key={type}
            className="rounded-md bg-[var(--color-muted-soft)] px-2 py-1 text-[11px] font-medium text-[var(--color-text)]"
          >
            {ASSET_TYPE_LABELS[type]}
          </span>
        ))}
      </div>

      <div className="mt-auto space-y-3 pt-5">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] leading-relaxed text-[var(--color-muted)]">
          <span>
            <span className="text-[var(--color-text)]">フェーズ</span>{" "}
            {asset.stages.map((stage) => STAGE_LABELS[stage]).join(" / ")}
          </span>
          {asset.region && (
            <span>
              <span className="text-[var(--color-text)]">地域</span>{" "}
              {asset.region}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone[status.tone]}`}
            >
              {status.label}
            </span>
            <span className="min-w-0 truncate text-[11px] text-[var(--color-muted)]">
              {status.detail}
            </span>
          </span>
          <span className="shrink-0 text-xs font-medium text-[var(--color-text)] opacity-60 transition-opacity group-hover:opacity-100">
            開く →
          </span>
        </div>
      </div>
    </a>
  );
}
