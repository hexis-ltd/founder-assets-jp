"use client";

import { useMemo, useState } from "react";
import { assets } from "@/lib/data";
import {
  type AssetType,
  type Equity,
  type Stage,
  type TimingType,
  ASSET_TYPE_LABELS,
  EQUITY_LABELS,
  STAGE_LABELS,
  TIMING_LABELS,
} from "@/lib/types";
import { AssetCard } from "./AssetCard";

type FilterKind = "assetType" | "stage" | "equity" | "timing";

const ASSET_TYPE_ORDER = Object.keys(ASSET_TYPE_LABELS) as AssetType[];
const STAGE_ORDER = Object.keys(STAGE_LABELS) as Stage[];
const EQUITY_ORDER = Object.keys(EQUITY_LABELS) as Equity[];
const TIMING_ORDER = Object.keys(TIMING_LABELS) as TimingType[];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function Directory() {
  const [query, setQuery] = useState("");
  const [assetTypeF, setAssetTypeF] = useState<Set<AssetType>>(new Set());
  const [stageF, setStageF] = useState<Set<Stage>>(new Set());
  const [equityF, setEquityF] = useState<Set<Equity>>(new Set());
  const [timingF, setTimingF] = useState<Set<TimingType>>(new Set());

  function toggle<T>(set: Set<T>, value: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
  }

  const activeCount =
    assetTypeF.size + stageF.size + equityF.size + timingF.size;

  function clearAll() {
    setAssetTypeF(new Set());
    setStageF(new Set());
    setEquityF(new Set());
    setTimingF(new Set());
    setQuery("");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((a) => {
      if (q) {
        const haystack = [
          a.name,
          a.nameEn ?? "",
          a.operator,
          a.summary,
          a.value ?? "",
          a.eligibility ?? "",
          ...(a.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (
        assetTypeF.size > 0 &&
        !a.assetTypes.some((t) => assetTypeF.has(t))
      )
        return false;
      // stage: any は常にマッチ扱い
      if (
        stageF.size > 0 &&
        !a.stages.some((s) => stageF.has(s) || s === "any")
      )
        return false;
      if (equityF.size > 0 && !equityF.has(a.equity)) return false;
      if (timingF.size > 0 && !timingF.has(a.timingType)) return false;
      return true;
    });
  }, [query, assetTypeF, stageF, equityF, timingF]);

  return (
    <div className="flex flex-col gap-6">
      {/* 検索 */}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キーワードで検索（例: 無料オフィス、AWS、未踏、海外、ディープテック）"
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)]"
        />
      </div>

      {/* フィルタ */}
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-4">
        <FilterGroup label="提供アセット種別">
          {ASSET_TYPE_ORDER.map((t) => (
            <Chip
              key={t}
              active={assetTypeF.has(t)}
              onClick={() => toggle(assetTypeF, t, setAssetTypeF)}
            >
              {ASSET_TYPE_LABELS[t]}
            </Chip>
          ))}
        </FilterGroup>

        <div className="grid gap-4 sm:grid-cols-3">
          <FilterGroup label="対象フェーズ">
            {STAGE_ORDER.filter((s) => s !== "any").map((s) => (
              <Chip
                key={s}
                active={stageF.has(s)}
                onClick={() => toggle(stageF, s, setStageF)}
              >
                {STAGE_LABELS[s]}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="エクイティ有無">
            {EQUITY_ORDER.map((e) => (
              <Chip
                key={e}
                active={equityF.has(e)}
                onClick={() => toggle(equityF, e, setEquityF)}
              >
                {EQUITY_LABELS[e]}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="申込時期">
            {TIMING_ORDER.map((t) => (
              <Chip
                key={t}
                active={timingF.has(t)}
                onClick={() => toggle(timingF, t, setTimingF)}
              >
                {TIMING_LABELS[t]}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </div>

      {/* 件数 + クリア */}
      <div className="flex items-center justify-between text-sm text-[var(--color-muted)]">
        <span>
          <span className="font-semibold text-[var(--color-text)]">
            {filtered.length}
          </span>{" "}
          / {assets.length} 件
        </span>
        {(activeCount > 0 || query) && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
          >
            条件をクリア（{activeCount + (query ? 1 : 0)}）
          </button>
        )}
      </div>

      {/* グリッド */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] py-16 text-center text-sm text-[var(--color-muted)]">
          条件に合うアセットが見つかりませんでした。条件を緩めてお試しください。
        </div>
      )}
    </div>
  );
}
