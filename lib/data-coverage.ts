import {
  type Asset,
  ASSET_TYPE_LABELS,
  STATUS_LABELS,
  STAGE_LABELS,
} from "./types";

export type CoverageItem = {
  count: number;
  label: string;
  value: string;
};

export type DataCoverage = {
  assetTypes: CoverageItem[];
  regions: CoverageItem[];
  stages: CoverageItem[];
  statuses: CoverageItem[];
  total: number;
};

const REGION_PRIORITY = [
  "全国",
  "東京",
  "北海道",
  "東北",
  "神奈川",
  "大阪",
  "関西",
  "京都",
  "兵庫",
  "東海",
  "愛知",
  "福岡",
  "九州",
  "海外",
  "グローバル",
  "米国",
] as const;

export function getDataCoverage(assets: Asset[]): DataCoverage {
  return {
    assetTypes: countValues(
      assets.flatMap((asset) => asset.assetTypes),
      ASSET_TYPE_LABELS,
    ),
    regions: countPlainValues(assets.flatMap(getAssetRegions)).toSorted(
      compareRegionCoverage,
    ),
    stages: countValues(assets.flatMap((asset) => asset.stages), STAGE_LABELS),
    statuses: countValues(
      assets.map((asset) => asset.application.status),
      STATUS_LABELS,
    ),
    total: assets.length,
  };
}

function countValues<T extends string>(
  values: T[],
  labels: Record<T, string>,
): CoverageItem[] {
  return sortCoverage(
    Object.entries(countOccurrences(values)).map(([value, count]) => ({
      count,
      label: labels[value as T],
      value,
    })),
  );
}

function countPlainValues(values: string[]): CoverageItem[] {
  return sortCoverage(
    Object.entries(countOccurrences(values)).map(([value, count]) => ({
      count,
      label: value,
      value,
    })),
  );
}

function countOccurrences(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>(
    (counts, value) => ({ ...counts, [value]: (counts[value] ?? 0) + 1 }),
    {},
  );
}

function getAssetRegions(asset: Asset): string[] {
  if (!asset.region) return [];
  const compact = asset.region.replace(/[（(].*?[）)]/g, "");
  return [
    ...new Set(
      compact
        .split(/[→/／・,、]/)
        .map((item) => item.trim())
        .flatMap(toRegionFacets)
        .filter(Boolean),
    ),
  ];
}

function toRegionFacets(label: string): string[] {
  const matched = REGION_PRIORITY.filter((region) => label.includes(region));
  return matched.length > 0 ? [...matched] : [label];
}

function sortCoverage(items: CoverageItem[]): CoverageItem[] {
  return items.toSorted((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label, "ja");
  });
}

function compareRegionCoverage(a: CoverageItem, b: CoverageItem): number {
  if (b.count !== a.count) return b.count - a.count;
  const ai = REGION_PRIORITY.indexOf(a.value as (typeof REGION_PRIORITY)[number]);
  const bi = REGION_PRIORITY.indexOf(b.value as (typeof REGION_PRIORITY)[number]);
  return rankRegion(ai) - rankRegion(bi);
}

function rankRegion(index: number): number {
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
