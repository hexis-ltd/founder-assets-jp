"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AssetCard } from "@/components/AssetCard";
import type { PublicUser } from "@/lib/auth/session";
import {
  type ChipOption,
  type FilterState,
  createEmptyFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  getActiveCount,
  getFilteredAssets,
  getRegionOptions,
  toggleValue,
} from "@/lib/directory-utils";
import {
  ASSET_TYPE_LABELS,
  EQUITY_LABELS,
  STAGE_LABELS,
  STATUS_LABELS,
  type Asset,
  type AssetType,
  type ApplicationStatus,
  type Equity,
  type Stage,
  type UserAssetState,
  type UserAssetStatus,
} from "@/lib/types";

const assetTypeOptions = toOptions(ASSET_TYPE_LABELS);
const stageOptions = toOptions(STAGE_LABELS);
const equityOptions = toOptions(EQUITY_LABELS);
const statusOptions = toOptions(STATUS_LABELS);

function toOptions<T extends string>(
  labels: Record<T, string>,
): ChipOption<T>[] {
  return Object.entries(labels).map(([value, label]) => ({
    label: label as string,
    value: value as T,
  }));
}

type FilterMenuId =
  | "assetTypes"
  | "equities"
  | "regions"
  | "stages"
  | "statuses";

function FilterMenu<T extends string>({
  activeMenu,
  align = "left",
  id,
  label,
  onToggle,
  onToggleMenu,
  options,
  selected,
}: {
  activeMenu: FilterMenuId | undefined;
  align?: "left" | "right";
  id: FilterMenuId;
  label: string;
  onToggle: (value: T) => void;
  onToggleMenu: (id: FilterMenuId) => void;
  options: ChipOption<T>[];
  selected: T[];
}) {
  const open = activeMenu === id;
  const summary = getFilterSummary(options, selected);
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${label}: ${summary || "すべて"}`}
        onClick={() => onToggleMenu(id)}
        className={`inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
          open
            ? "border-[var(--color-text)] bg-[var(--color-bg)] text-[var(--color-text)]"
            : selected.length > 0
              ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]"
              : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
        }`}
      >
        <span className="shrink-0 opacity-70">{label}</span>
        <span className="h-1 w-1 shrink-0 rounded-full bg-current opacity-30" />
        <span className="truncate">{summary || "すべて"}</span>
      </button>
      {open && (
        <div
          className={`absolute z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-xl shadow-black/10 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="listbox"
          aria-label={label}
        >
          <div className="px-2 py-1.5 text-[11px] font-semibold text-[var(--color-muted)]">
            {label}
          </div>
          <div className="max-h-64 overflow-auto">
            {options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={checked}
                  onClick={() => onToggle(option.value)}
                  className={`flex min-h-9 w-full items-center justify-between gap-3 rounded-lg px-2 text-left text-xs transition-colors ${
                    checked
                      ? "bg-[var(--color-muted-soft)] text-[var(--color-text)]"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <span>{option.label}</span>
                  {checked && <span className="text-[10px]">選択中</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getFilterSummary<T extends string>(
  options: ChipOption<T>[],
  selected: T[],
): string {
  if (selected.length === 0) return "";
  const labels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label);
  if (labels.length <= 2) return labels.join("、");
  return `${labels[0]} ほか${labels.length - 1}`;
}

function FilterPanel({
  filters,
  regionOptions,
  onFiltersChange,
}: {
  filters: FilterState;
  regionOptions: ChipOption<string>[];
  onFiltersChange: (filters: FilterState) => void;
}) {
  const [activeMenu, setActiveMenu] = useState<FilterMenuId | undefined>();
  const menuRootRef = useRef<HTMLDivElement>(null);
  const toggleMenu = (id: FilterMenuId) =>
    setActiveMenu((current) => (current === id ? undefined : id));
  useEffect(() => {
    if (!activeMenu) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (menuRootRef.current?.contains(event.target as Node)) return;
      setActiveMenu(undefined);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeMenu]);
  return (
    <div
      ref={menuRootRef}
      className="flex flex-wrap gap-2"
      onKeyDown={(event) => {
        if (event.key === "Escape") setActiveMenu(undefined);
      }}
    >
      <FilterMenu
        activeMenu={activeMenu}
        id="assetTypes"
        label="種別"
        onToggleMenu={toggleMenu}
        options={assetTypeOptions}
        selected={filters.assetTypes}
        onToggle={(value: AssetType) =>
          onFiltersChange({
            ...filters,
            assetTypes: toggleValue(filters.assetTypes, value),
          })
        }
      />
      <FilterMenu
        activeMenu={activeMenu}
        id="stages"
        label="フェーズ"
        onToggleMenu={toggleMenu}
        options={stageOptions}
        selected={filters.stages}
        onToggle={(value: Stage) =>
          onFiltersChange({
            ...filters,
            stages: toggleValue(filters.stages, value),
          })
        }
      />
      <FilterMenu
        activeMenu={activeMenu}
        id="equities"
        label="エクイティ"
        onToggleMenu={toggleMenu}
        options={equityOptions}
        selected={filters.equities}
        onToggle={(value: Equity) =>
          onFiltersChange({
            ...filters,
            equities: toggleValue(filters.equities, value),
          })
        }
      />
      <FilterMenu
        activeMenu={activeMenu}
        align="right"
        id="statuses"
        label="募集状況"
        onToggleMenu={toggleMenu}
        options={statusOptions}
        selected={filters.statuses}
        onToggle={(value: ApplicationStatus) =>
          onFiltersChange({
            ...filters,
            statuses: toggleValue(filters.statuses, value),
          })
        }
      />
      <FilterMenu
        activeMenu={activeMenu}
        align="right"
        id="regions"
        label="地域"
        onToggleMenu={toggleMenu}
        options={regionOptions}
        selected={filters.regions}
        onToggle={(value) =>
          onFiltersChange({
            ...filters,
            regions: toggleValue(filters.regions, value),
          })
        }
      />
    </div>
  );
}

function ResultToolbar({
  assetCount,
  filters,
  onClear,
  resultCount,
}: {
  assetCount: number;
  filters: FilterState;
  onClear: () => void;
  resultCount: number;
}) {
  const activeCount = getActiveCount(filters);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
      <span className="font-medium text-[var(--color-text)]">
        {resultCount} / {assetCount} 件
      </span>
      <div className="flex items-center gap-3">
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="font-medium text-[var(--color-text)] underline decoration-dotted underline-offset-4"
          >
            条件をクリア
          </button>
        )}
      </div>
    </div>
  );
}

function SearchBox({
  assetCount,
  filters,
  regionOptions,
  resultCount,
  onClear,
  onFiltersChange,
}: {
  assetCount: number;
  filters: FilterState;
  regionOptions: ChipOption<string>[];
  resultCount: number;
  onClear: () => void;
  onFiltersChange: (filters: FilterState) => void;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-xl shadow-black/[0.04]">
      <label className="block">
        <span className="sr-only">キーワード検索</span>
        <input
          autoFocus
          value={filters.query}
          onChange={(event) =>
            onFiltersChange({ ...filters, query: event.target.value })
          }
          placeholder="支援を検索"
          className="h-14 w-full rounded-2xl border-0 bg-transparent px-4 text-base text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
        />
      </label>
      <div className="grid gap-3 rounded-2xl bg-[var(--color-bg)] px-3 py-3">
        <ResultToolbar
          assetCount={assetCount}
          filters={filters}
          onClear={onClear}
          resultCount={resultCount}
        />
        <FilterPanel
          filters={filters}
          regionOptions={regionOptions}
          onFiltersChange={onFiltersChange}
        />
      </div>
    </section>
  );
}

function ResultList({
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
        見つかりませんでした。別のキーワードで検索してください。
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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(() =>
    filtersFromSearchParams(searchParams),
  );
  const [stateByAssetId, setStateByAssetId] = useState<
    Record<string, UserAssetState>
  >(() => statesToRecord(initialStates));
  const [savingAssetId, setSavingAssetId] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [now, setNow] = useState<Date | undefined>(undefined);
  const previousSearch = useRef(searchParams.toString());
  const regionOptions = useMemo(() => getRegionOptions(assets), [assets]);
  const filtered = useMemo(
    () => getFilteredAssets(assets, filters),
    [assets, filters],
  );

  useEffect(() => setNow(new Date()), []);
  useEffect(
    () => setStateByAssetId(statesToRecord(initialStates)),
    [initialStates, user?.id],
  );
  useEffect(() => {
    const current = searchParams.toString();
    if (current === previousSearch.current) return;
    previousSearch.current = current;
    setFilters(filtersFromSearchParams(searchParams));
  }, [searchParams]);
  useEffect(() => {
    const nextSearch = filtersToSearchParams(filters).toString();
    if (nextSearch === previousSearch.current) return;
    previousSearch.current = nextSearch;
    const next = nextSearch ? `${pathname}?${nextSearch}` : pathname;
    router.replace(next, { scroll: false });
  }, [filters, pathname, router]);

  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <SearchBox
        assetCount={assets.length}
        filters={filters}
        regionOptions={regionOptions}
        resultCount={filtered.length}
        onClear={() => setFilters(createEmptyFilters())}
        onFiltersChange={setFilters}
      />
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      <ResultList
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
      return Object.fromEntries(
        Object.entries(current).filter(([currentAssetId]) => {
          return currentAssetId !== assetId;
        }),
      );
    }
    return { ...current, [assetId]: body.state as UserAssetState };
  });
}
