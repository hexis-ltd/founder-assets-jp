import {
  type Asset,
  type UserAssetState,
  type UserAssetStatus,
  EQUITY_LABELS,
  USER_ASSET_STATUS_LABELS,
  getStatusDisplay,
} from "@/lib/types";
import {
  type DecisionItem,
  getApplicationTiming,
  getAssetDecisionProfile,
} from "@/lib/asset-decision";

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

const effortTone: Record<
  ReturnType<typeof getAssetDecisionProfile>["effortLevel"]["tone"],
  string
> = {
  high: "border-rose-200 bg-rose-50 text-rose-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  unknown:
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
  const profile = getAssetDecisionProfile(asset, now);
  const timing = getApplicationTiming(asset);
  const currentStatus = userState?.status ?? "not_started";

  return (
    <article className="grid min-w-0 w-full gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-text)]/25">
      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-[var(--color-muted)]">
              {asset.operator}
            </p>
            <h3 className="mt-1 text-base font-semibold leading-snug text-[var(--color-text)]">
              {asset.name}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:max-w-64 sm:justify-end">
            <span className="text-[11px] font-semibold leading-snug text-[var(--color-text)] sm:text-right">
              {timing.label}: {timing.value}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${equityTone[asset.equity]}`}
            >
              {EQUITY_LABELS[asset.equity]}
            </span>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">
          {asset.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone[status.tone]}`}
          >
            {status.label}
          </span>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${effortTone[profile.effortLevel.tone]}`}
          >
            手間: {profile.effortLevel.label}
          </span>
        </div>
      </div>

      <div className="grid gap-4 border-t border-[var(--color-border)] pt-4 md:grid-cols-3">
        <DecisionSection items={profile.fit} title="自分が使えるか" />
        <DecisionSection items={profile.effort} title="手間とコスト" />
        <DecisionSection items={profile.return} title="リターン" />
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        {asset.tags && asset.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {asset.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded bg-[var(--color-muted-soft)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2 sm:min-w-64">
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

function DecisionSection({
  items,
  title,
}: {
  items: DecisionItem[];
  title: string;
}) {
  return (
    <section className="min-w-0">
      <h4 className="text-xs font-semibold text-[var(--color-text)]">
        {title}
      </h4>
      <dl className="mt-2 grid gap-1.5 text-[11px] leading-relaxed">
        {items.map((item) => (
          <div key={`${item.label}:${item.value}`} className="min-w-0">
            <dt className="font-medium text-[var(--color-text)]">
              {item.label}
            </dt>
            <dd className="mt-0.5 line-clamp-3 text-[var(--color-muted)]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
