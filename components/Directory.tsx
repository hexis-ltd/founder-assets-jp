"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AssetCard } from "@/components/AssetCard";
import type { PublicUser } from "@/lib/auth/session";
import { LAST_CHECKED } from "@/lib/data";
import {
  type ApplicationStatus,
  type Asset,
  type AssetType,
  type Equity,
  type Stage,
  type UserAssetState,
  type UserAssetStatus,
  ASSET_TYPE_LABELS,
  EQUITY_LABELS,
  STAGE_LABELS,
  STATUS_LABELS,
  compareByDeadline,
  getStatusDisplay,
} from "@/lib/types";

type FilterState = {
  query: string;
  assetTypes: AssetType[];
  stages: Stage[];
  equities: Equity[];
  statuses: ApplicationStatus[];
};

type ViewMode = "all" | "saved" | "untracked";

type ChipOption<T extends string> = {
  label: string;
  value: T;
};

const assetTypeOptions = toOptions(ASSET_TYPE_LABELS);
const stageOptions = toOptions(STAGE_LABELS).filter(
  (option) => option.value !== "any",
);
const equityOptions = toOptions(EQUITY_LABELS);
const statusOptions = toOptions(STATUS_LABELS);

function toOptions<T extends string>(
  labels: Record<T, string>,
): ChipOption<T>[] {
  return Object.entries(labels).map(([value, label]) => ({
    value: value as T,
    label: label as string,
  }));
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getActiveCount(filters: FilterState): number {
  return (
    filters.assetTypes.length +
    filters.stages.length +
    filters.equities.length +
    filters.statuses.length +
    (filters.query.trim() ? 1 : 0)
  );
}

function getFilteredAssets(assets: Asset[], filters: FilterState): Asset[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  return assets
    .filter((asset) => matchesQuery(asset, normalizedQuery))
    .filter((asset) => matchesAssetTypes(asset, filters.assetTypes))
    .filter((asset) => matchesStages(asset, filters.stages))
    .filter((asset) => matchesEquities(asset, filters.equities))
    .filter((asset) => matchesStatuses(asset, filters.statuses))
    .toSorted(compareByDeadline);
}

function getVisibleAssets({
  assets,
  filters,
  stateByAssetId,
  viewMode,
}: {
  assets: Asset[];
  filters: FilterState;
  stateByAssetId: Record<string, UserAssetState>;
  viewMode: ViewMode;
}): Asset[] {
  return getFilteredAssets(assets, filters).filter((asset) =>
    matchesViewMode(asset, stateByAssetId, viewMode),
  );
}

function matchesViewMode(
  asset: Asset,
  stateByAssetId: Record<string, UserAssetState>,
  viewMode: ViewMode,
): boolean {
  if (viewMode === "all") return true;
  const tracked = Boolean(stateByAssetId[asset.id]);
  return viewMode === "saved" ? tracked : !tracked;
}

function matchesQuery(asset: Asset, query: string): boolean {
  if (!query) return true;
  return getSearchText(asset).includes(query);
}

function getSearchText(asset: Asset): string {
  const status = getStatusDisplay(asset.application);
  return [
    asset.name,
    asset.nameEn ?? "",
    asset.operator,
    asset.summary,
    asset.value ?? "",
    asset.eligibility ?? "",
    status.label,
    status.detail,
    ...(asset.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function matchesAssetTypes(asset: Asset, selected: AssetType[]): boolean {
  return selected.length === 0
    ? true
    : asset.assetTypes.some((type) => selected.includes(type));
}

function matchesStages(asset: Asset, selected: Stage[]): boolean {
  return selected.length === 0
    ? true
    : asset.stages.some((stage) => selected.includes(stage) || stage === "any");
}

function matchesEquities(asset: Asset, selected: Equity[]): boolean {
  return selected.length === 0 ? true : selected.includes(asset.equity);
}

function matchesStatuses(asset: Asset, selected: ApplicationStatus[]): boolean {
  return selected.length === 0
    ? true
    : selected.includes(asset.application.status);
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 items-center rounded-md border px-2.5 text-xs font-medium transition-colors ${
        active
          ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-text)]/25 hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );
}

function ChipList<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: ChipOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="text-[11px] font-semibold uppercase text-[var(--color-muted)]">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <Chip
            key={option.value}
            active={selected.includes(option.value)}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function FilterPanel({
  canTrack,
  embedded = false,
  filters,
  savedCount,
  untrackedCount,
  viewMode,
  onViewModeChange,
  onToggleAssetType,
  onToggleStage,
  onToggleEquity,
  onToggleStatus,
}: {
  canTrack: boolean;
  embedded?: boolean;
  filters: FilterState;
  savedCount: number;
  untrackedCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleAssetType: (value: AssetType) => void;
  onToggleStage: (value: Stage) => void;
  onToggleEquity: (value: Equity) => void;
  onToggleStatus: (value: ApplicationStatus) => void;
}) {
  return (
    <aside
      className={
        embedded
          ? "p-0"
          : "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      }
    >
      {!embedded && (
        <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--color-text)]">
          Filters
        </h2>
        <span className="text-xs text-[var(--color-muted)]">
          {getActiveCount(filters)} active
        </span>
      </div>
      )}
      <ViewTabs
        canTrack={canTrack}
        savedCount={savedCount}
        untrackedCount={untrackedCount}
        value={viewMode}
        onChange={onViewModeChange}
      />
      <div className="mt-5 grid gap-5 border-t border-[var(--color-border)] pt-5">
        <ChipList
          label="提供アセット"
          options={assetTypeOptions}
          selected={filters.assetTypes}
          onToggle={onToggleAssetType}
        />
        <ChipList
          label="対象フェーズ"
          options={stageOptions}
          selected={filters.stages}
          onToggle={onToggleStage}
        />
        <ChipList
          label="エクイティ"
          options={equityOptions}
          selected={filters.equities}
          onToggle={onToggleEquity}
        />
        <ChipList
          label="募集ステータス"
          options={statusOptions}
          selected={filters.statuses}
          onToggle={onToggleStatus}
        />
      </div>
    </aside>
  );
}

function ViewTabs({
  canTrack,
  savedCount,
  untrackedCount,
  value,
  onChange,
}: {
  canTrack: boolean;
  savedCount: number;
  untrackedCount: number;
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  const tabs = [
    { label: "すべて", value: "all" as const },
    { label: `保存済み ${savedCount}`, value: "saved" as const },
    { label: `未整理 ${untrackedCount}`, value: "untracked" as const },
  ];
  return (
    <div className="grid gap-1 rounded-md bg-[var(--color-surface-2)] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          disabled={!canTrack && tab.value !== "all"}
          onClick={() => onChange(tab.value)}
          className={`h-8 rounded px-3 text-xs font-medium transition-colors ${
            value === tab.value
              ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
              : "text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-45"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function SearchRow({
  assetCount,
  query,
  resultCount,
  onQueryChange,
}: {
  assetCount: number;
  query: string;
  resultCount: number;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex flex-col gap-3 sm:flex-row">
      <label className="min-w-0 flex-1">
        <span className="sr-only">キーワード検索</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="キーワードで検索"
          className="h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-text)]"
        />
      </label>
      <div className="flex h-10 items-center justify-between gap-3 rounded-md bg-[var(--color-surface-2)] px-3 text-sm sm:w-48">
        <span className="text-[var(--color-muted)]">表示中</span>
        <span className="font-semibold text-[var(--color-text)]">
          {resultCount} / {assetCount}
        </span>
      </div>
      </div>
    </div>
  );
}

function ResultSummary({
  activeCount,
  canTrack,
  onClear,
}: {
  activeCount: number;
  canTrack: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs leading-relaxed text-[var(--color-muted)]">
          日付は{LAST_CHECKED}時点の目安です。最新は各公式サイトをご確認ください。
          {!canTrack && " ログインすると各アセットの進捗を保存できます。"}
        </p>
      </div>
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-8 w-fit items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-text)]/25 hover:text-[var(--color-text)]"
        >
          条件をクリア（{activeCount}）
        </button>
      )}
    </div>
  );
}

function AssetGrid({
  canTrack,
  filtered,
  now,
  onUserStatusChange,
  savingAssetId,
  stateByAssetId,
}: {
  canTrack: boolean;
  filtered: Asset[];
  now?: Date;
  onUserStatusChange: (assetId: string, status: UserAssetStatus) => void;
  savingAssetId?: string;
  stateByAssetId: Record<string, UserAssetState>;
}) {
  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center text-sm text-[var(--color-muted)]">
        条件に合うアセットが見つかりませんでした。条件を緩めてお試しください。
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {filtered.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          canTrack={canTrack}
          now={now}
          onUserStatusChange={onUserStatusChange}
          saving={savingAssetId === asset.id}
          userState={stateByAssetId[asset.id]}
        />
      ))}
    </div>
  );
}

export function Directory({
  assets,
  initialStates,
  user,
}: {
  assets: Asset[];
  initialStates: UserAssetState[];
  user: PublicUser | null;
}) {
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    assetTypes: [],
    stages: [],
    equities: [],
    statuses: [],
  });
  const [stateByAssetId, setStateByAssetId] = useState<
    Record<string, UserAssetState>
  >(() => statesToRecord(initialStates));
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [savingAssetId, setSavingAssetId] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const filtered = useMemo(
    () => getVisibleAssets({ assets, filters, stateByAssetId, viewMode }),
    [assets, filters, stateByAssetId, viewMode],
  );
  const activeCount = getActiveCount(filters);
  const savedCount = Object.keys(stateByAssetId).length;
  const untrackedCount = Math.max(assets.length - savedCount, 0);
  const [now, setNow] = useState<Date | undefined>(undefined);

  useEffect(() => setNow(new Date()), []);
  useEffect(
    () => setStateByAssetId(statesToRecord(initialStates)),
    [initialStates, user?.id],
  );
  useEffect(() => {
    if (!user) setViewMode("all");
  }, [user]);

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <section className="min-w-0 space-y-5 lg:order-2">
        <SearchRow
          assetCount={assets.length}
          query={filters.query}
          resultCount={filtered.length}
          onQueryChange={(query) =>
            setFilters((state) => ({ ...state, query }))
          }
        />
        <div className="lg:hidden">
          <details className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-[var(--color-text)]">
              Filters
              <span className="text-xs font-normal text-[var(--color-muted)]">
                {activeCount} active
              </span>
            </summary>
            <div className="border-t border-[var(--color-border)] p-4">
              <FilterPanel
                canTrack={Boolean(user)}
                embedded
                filters={filters}
                savedCount={savedCount}
                untrackedCount={untrackedCount}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onToggleAssetType={(value) =>
                  setFilters((state) => ({
                    ...state,
                    assetTypes: toggleValue(state.assetTypes, value),
                  }))
                }
                onToggleStage={(value) =>
                  setFilters((state) => ({
                    ...state,
                    stages: toggleValue(state.stages, value),
                  }))
                }
                onToggleEquity={(value) =>
                  setFilters((state) => ({
                    ...state,
                    equities: toggleValue(state.equities, value),
                  }))
                }
                onToggleStatus={(value) =>
                  setFilters((state) => ({
                    ...state,
                    statuses: toggleValue(state.statuses, value),
                  }))
                }
              />
            </div>
          </details>
        </div>
        <ResultSummary
          activeCount={activeCount}
          canTrack={Boolean(user)}
          onClear={() =>
            setFilters({
              query: "",
              assetTypes: [],
              stages: [],
              equities: [],
              statuses: [],
            })
          }
        />
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        <AssetGrid
          canTrack={Boolean(user)}
          filtered={filtered}
          now={now}
          onUserStatusChange={(assetId, status) =>
            saveUserStatus({
              assetId,
              setError,
              setSavingAssetId,
              setStateByAssetId,
              status,
            })
          }
          savingAssetId={savingAssetId}
          stateByAssetId={stateByAssetId}
        />
      </section>
      <div className="hidden lg:order-1 lg:block lg:sticky lg:top-6 lg:self-start">
        <FilterPanel
          canTrack={Boolean(user)}
          filters={filters}
          savedCount={savedCount}
          untrackedCount={untrackedCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onToggleAssetType={(value) =>
            setFilters((state) => ({
              ...state,
              assetTypes: toggleValue(state.assetTypes, value),
            }))
          }
          onToggleStage={(value) =>
            setFilters((state) => ({
              ...state,
              stages: toggleValue(state.stages, value),
            }))
          }
          onToggleEquity={(value) =>
            setFilters((state) => ({
              ...state,
              equities: toggleValue(state.equities, value),
            }))
          }
          onToggleStatus={(value) =>
            setFilters((state) => ({
              ...state,
              statuses: toggleValue(state.statuses, value),
            }))
          }
        />
      </div>
    </div>
  );
}

function statesToRecord(
  states: UserAssetState[],
): Record<string, UserAssetState> {
  return Object.fromEntries(states.map((state) => [state.assetId, state]));
}

async function saveUserStatus({
  assetId,
  setError,
  setSavingAssetId,
  setStateByAssetId,
  status,
}: {
  assetId: string;
  setError: (message: string | undefined) => void;
  setSavingAssetId: (assetId: string | undefined) => void;
  setStateByAssetId: Dispatch<SetStateAction<Record<string, UserAssetState>>>;
  status: UserAssetStatus;
}) {
  setError(undefined);
  setSavingAssetId(assetId);
  const response = await fetch("/api/me/asset-states", {
    body: JSON.stringify({ assetId, status }),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    state?: UserAssetState;
  };
  setSavingAssetId(undefined);
  if (!response.ok || !body.state) {
    setError(body.error ?? "状態の保存に失敗しました");
    return;
  }
  setStateByAssetId((current) => {
    if (body.state?.status === "not_started") {
      const { [assetId]: _removed, ...rest } = current;
      return rest;
    }
    return { ...current, [assetId]: body.state as UserAssetState };
  });
}
