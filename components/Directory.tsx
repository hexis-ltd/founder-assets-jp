"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AssetCard } from "@/components/AssetCard";
import { assets, LAST_CHECKED } from "@/lib/data";
import {
  type ApplicationStatus,
  type Asset,
  type AssetType,
  type Equity,
  type Stage,
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

function getFilteredAssets(filters: FilterState): Asset[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  return assets
    .filter((asset) => matchesQuery(asset, normalizedQuery))
    .filter((asset) => matchesAssetTypes(asset, filters.assetTypes))
    .filter((asset) => matchesStages(asset, filters.stages))
    .filter((asset) => matchesEquities(asset, filters.equities))
    .filter((asset) => matchesStatuses(asset, filters.statuses))
    .toSorted(compareByDeadline);
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
      className={`inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors ${
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
  filters,
  resultCount,
  onQueryChange,
  onToggleAssetType,
  onToggleStage,
  onToggleEquity,
  onToggleStatus,
}: {
  filters: FilterState;
  resultCount: number;
  onQueryChange: (query: string) => void;
  onToggleAssetType: (value: AssetType) => void;
  onToggleStage: (value: Stage) => void;
  onToggleEquity: (value: Equity) => void;
  onToggleStatus: (value: ApplicationStatus) => void;
}) {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[0_28px_80px_-64px_rgb(0_0_0/0.7)]">
      <SearchRow
        query={filters.query}
        resultCount={resultCount}
        onQueryChange={onQueryChange}
      />
      <div className="mt-4 grid gap-5 border-t border-[var(--color-border)] pt-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
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
    </section>
  );
}

function SearchRow({
  query,
  resultCount,
  onQueryChange,
}: {
  query: string;
  resultCount: number;
  onQueryChange: (query: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <label className="min-w-0 flex-1">
        <span className="sr-only">キーワード検索</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="キーワードで検索（例: 無料オフィス、AWS、未踏、海外、ディープテック）"
          className="h-12 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-text)]"
        />
      </label>
      <div className="flex items-center justify-between gap-3 rounded-md bg-[var(--color-surface-2)] px-4 py-3 text-sm lg:w-56">
        <span className="text-[var(--color-muted)]">表示中</span>
        <span className="font-semibold text-[var(--color-text)]">
          {resultCount} / {assets.length}
        </span>
      </div>
    </div>
  );
}

function ResultSummary({
  activeCount,
  onClear,
}: {
  activeCount: number;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--color-muted)]">
        締切が近い順（募集中→募集予定→通年→定期→終了）に整理。日付は
        {LAST_CHECKED}時点の目安です。最新は各公式サイトをご確認ください。
      </p>
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-9 w-fit items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-xs font-medium text-[var(--color-muted)] transition-colors hover:border-[var(--color-text)]/25 hover:text-[var(--color-text)]"
        >
          条件をクリア（{activeCount}）
        </button>
      )}
    </div>
  );
}

function AssetGrid({ filtered, now }: { filtered: Asset[]; now?: Date }) {
  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] py-16 text-center text-sm text-[var(--color-muted)]">
        条件に合うアセットが見つかりませんでした。条件を緩めてお試しください。
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((asset) => (
        <AssetCard key={asset.id} asset={asset} now={now} />
      ))}
    </div>
  );
}

export function Directory() {
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    assetTypes: [],
    stages: [],
    equities: [],
    statuses: [],
  });
  const filtered = useMemo(() => getFilteredAssets(filters), [filters]);
  const activeCount = getActiveCount(filters);

  // 残日数(「あと◯日」)はクライアントのマウント後に算出し、SSRとの不一致を避ける。
  const [now, setNow] = useState<Date | undefined>(undefined);
  useEffect(() => setNow(new Date()), []);

  return (
    <div className="space-y-6">
      <FilterPanel
        filters={filters}
        resultCount={filtered.length}
        onQueryChange={(query) => setFilters((state) => ({ ...state, query }))}
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
      <ResultSummary
        activeCount={activeCount}
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
      <AssetGrid filtered={filtered} now={now} />
    </div>
  );
}
