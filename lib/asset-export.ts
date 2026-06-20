import type { Asset } from "./types";
import { withAssetScreening } from "./asset-screening";
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
  schemaVersion: 2;
};

export type AssetDatasetQuality = {
  hasApplicationStatus: number;
  hasOfficialUrl: number;
  hasRegion: number;
  hasScreening: number;
  hasScreeningSources: number;
  hasStructuredAmount: number;
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
  "screeningLastCheckedAt",
  "screeningSources",
  "screeningBenefitAmount",
  "screeningBenefitMaxAmountJpy",
  "screeningEffortLevel",
  "screeningRequiredDocuments",
  "screeningSelectionSteps",
  "screeningRiskLevel",
  "screeningRiskNotes",
  "tags",
] as const;

export function assetsToJsonDataset(
  assets: Asset[],
  lastChecked: string,
): AssetJsonDataset {
  const screenedAssets = assets.map(withAssetScreening);
  return {
    assets: screenedAssets,
    coverage: getDataCoverage(screenedAssets),
    count: screenedAssets.length,
    generatedAt: new Date().toISOString(),
    homepage: "https://github.com/hexis-ltd/founder-assets-jp",
    lastChecked,
    license: "MIT",
    quality: getDatasetQuality(screenedAssets),
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
        "screening",
        "tags",
      ],
      notes: [
        "application.status は open/upcoming/rolling/recurring/closed のいずれかです。",
        "deadline と opensAt は確定日が裏取りできた場合のみ YYYY-MM-DD で入ります。",
        "assetTypes、stages、tags は配列です。CSVではセミコロン区切りで出力します。",
        "screening は founder の一次判断に使う fit/benefit/effort/risk/source 情報です。",
        "金額・募集時期・応募条件は変動するため、最終確認は各公式URLで行ってください。",
      ],
    },
    schemaVersion: 2,
  };
}

export function assetsToCsv(assets: Asset[]): string {
  const rows = assets.map(withAssetScreening).map((asset) => {
    const screening = asset.screening;
    return [
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
      screening?.lastCheckedAt ?? "",
      (screening?.sources ?? []).map((source) => source.url).join(";"),
      screening?.benefit.amount?.label ?? "",
      screening?.benefit.amount?.maxAmountJpy?.toString() ?? "",
      screening?.effort.level ?? "",
      joinList(screening?.effort.requiredDocuments),
      joinList(screening?.effort.selectionSteps),
      screening?.risk.level ?? "",
      joinList(screening?.risk.notes),
      (asset.tags ?? []).join(";"),
    ]
      .map(escapeCsvField)
      .join(",");
  });
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
    hasScreening: assets.filter((asset) => Boolean(asset.screening)).length,
    hasScreeningSources: assets.filter(
      (asset) => (asset.screening?.sources ?? []).length > 0,
    ).length,
    hasStructuredAmount: assets.filter(
      (asset) => Boolean(asset.screening?.benefit.amount),
    ).length,
    hasTags: assets.filter((asset) => (asset.tags ?? []).length > 0).length,
  };
}

function joinList(values?: string[]): string {
  return values?.join(";") ?? "";
}
