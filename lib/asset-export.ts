import type { Asset } from "./types";
import { type DataCoverage, getDataCoverage } from "./data-coverage";

export type AssetJsonDataset = {
  assets: Asset[];
  coverage: DataCoverage;
  count: number;
  generatedAt: string;
  homepage: string;
  lastChecked: string;
  license: "MIT";
  quality: AssetDatasetQuality;
  schema: AssetDatasetSchema;
  schemaVersion: 1;
};

export type AssetDatasetQuality = {
  hasApplicationStatus: number;
  hasOfficialUrl: number;
  hasRegion: number;
  hasTags: number;
};

export type AssetDatasetSchema = {
  fields: string[];
  notes: string[];
};

export const assetCsvHeaders = [
  "id",
  "name",
  "nameEn",
  "operator",
  "region",
  "assetTypes",
  "stages",
  "equity",
  "applicationStatus",
  "deadline",
  "opensAt",
  "applicationWindow",
  "applicationNote",
  "value",
  "eligibility",
  "summary",
  "url",
  "tags",
] as const;

export function assetsToJsonDataset(
  assets: Asset[],
  lastChecked: string,
): AssetJsonDataset {
  return {
    assets,
    coverage: getDataCoverage(assets),
    count: assets.length,
    generatedAt: new Date().toISOString(),
    homepage: "https://github.com/hexis-ltd/founder-assets-jp",
    lastChecked,
    license: "MIT",
    quality: getDatasetQuality(assets),
    schema: {
      fields: [
        "id",
        "name",
        "nameEn",
        "operator",
        "region",
        "assetTypes",
        "stages",
        "equity",
        "application",
        "value",
        "eligibility",
        "summary",
        "url",
        "tags",
      ],
      notes: [
        "application.status は open/upcoming/rolling/recurring/closed のいずれかです。",
        "deadline と opensAt は確定日が裏取りできた場合のみ YYYY-MM-DD で入ります。",
        "assetTypes、stages、tags は配列です。CSVではセミコロン区切りで出力します。",
        "金額・募集時期・応募条件は変動するため、最終確認は各公式URLで行ってください。",
      ],
    },
    schemaVersion: 1,
  };
}

export function assetsToCsv(assets: Asset[]): string {
  const rows = assets.map((asset) =>
    [
      asset.id,
      asset.name,
      asset.nameEn ?? "",
      asset.operator,
      asset.region ?? "",
      asset.assetTypes.join(";"),
      asset.stages.join(";"),
      asset.equity,
      asset.application.status,
      asset.application.deadline ?? "",
      asset.application.opensAt ?? "",
      asset.application.window ?? "",
      asset.application.note ?? "",
      asset.value ?? "",
      asset.eligibility ?? "",
      asset.summary,
      asset.url,
      (asset.tags ?? []).join(";"),
    ]
      .map(escapeCsvField)
      .join(","),
  );
  return [assetCsvHeaders.join(","), ...rows].join("\n");
}

function escapeCsvField(value: string): string {
  if (!/[",\n\r]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

function getDatasetQuality(assets: Asset[]): AssetDatasetQuality {
  return {
    hasApplicationStatus: assets.filter((asset) => asset.application.status)
      .length,
    hasOfficialUrl: assets.filter((asset) => asset.url.startsWith("http"))
      .length,
    hasRegion: assets.filter((asset) => Boolean(asset.region)).length,
    hasTags: assets.filter((asset) => (asset.tags ?? []).length > 0).length,
  };
}
