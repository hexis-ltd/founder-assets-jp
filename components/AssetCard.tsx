import {
  type Asset,
  type UserAssetState,
  type UserAssetStatus,
  ASSET_TYPE_LABELS,
  EQUITY_LABELS,
  STAGE_LABELS,
  USER_ASSET_STATUS_LABELS,
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

export function AssetCard({
  asset,
  canTrack,
  now,
  onUserStatusChange,
  saving,
  userState,
}: {
  asset: Asset;
  canTrack: boolean;
  now?: Date;
  onUserStatusChange: (assetId: string, status: UserAssetStatus) => void;
  saving: boolean;
  userState?: UserAssetState;
}) {
  const status = getStatusDisplay(asset.application, now);
  const currentStatus = userState?.status ?? "not_started";

  return (
    <article className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-text)]/25 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0">
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

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">
        {asset.summary}
      </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {asset.assetTypes.slice(0, 4).map((type) => (
            <span
              key={type}
              className="rounded-md border border-[var(--color-border)] px-2 py-1 text-[11px] text-[var(--color-muted)]"
            >
              {ASSET_TYPE_LABELS[type]}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 lg:border-l lg:border-[var(--color-border)] lg:pl-4">
        <div className="flex flex-wrap items-center gap-2">
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone[status.tone]}`}
            >
              {status.label}
            </span>
            <span className="min-w-0 truncate text-[11px] text-[var(--color-muted)]">
              {status.detail}
            </span>
        </div>

        {asset.value && (
          <p className="text-sm font-medium leading-6 text-[var(--color-text)]">
            {asset.value}
          </p>
        )}

        <div className="space-y-1 text-[11px] leading-relaxed text-[var(--color-muted)]">
          <p>
            <span className="text-[var(--color-text)]">フェーズ</span>{" "}
            {asset.stages.map((stage) => STAGE_LABELS[stage]).join(" / ")}
          </p>
          {asset.region && (
            <p>
              <span className="text-[var(--color-text)]">地域</span>{" "}
              {asset.region}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          {canTrack ? (
              <select
                value={currentStatus}
                disabled={saving}
                onChange={(event) =>
                  onUserStatusChange(
                    asset.id,
                    event.target.value as UserAssetStatus,
                  )
                }
              className="h-9 min-w-0 flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-text)] disabled:opacity-50"
              >
                {Object.entries(USER_ASSET_STATUS_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
          ) : (
            <a
              href="/signin"
              className="flex h-9 min-w-0 flex-1 items-center justify-center rounded-md border border-[var(--color-border)] text-xs font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              進捗を保存
            </a>
          )}
          <a
            href={asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center rounded-md bg-[var(--color-text)] px-3 text-xs font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90"
          >
            公式
          </a>
        </div>
      </div>
    </article>
  );
}
