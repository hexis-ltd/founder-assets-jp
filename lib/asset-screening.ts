import {
  ASSET_TYPE_LABELS,
  type Asset,
  type AssetScreening,
  type AssetType,
  type ScreeningAmount,
  type ScreeningEffort,
  type ScreeningRisk,
} from "./types";

export const SCREENING_CHECKED_AT = "2026-06-21";

const BENEFIT_LABELS: Partial<Record<AssetType, string>> = {
  accelerator: "アクセラレーション",
  "cloud-credit": "クラウド/SaaSクレジット",
  community: "コミュニティ・ネットワーク",
  "free-office": "オフィス・作業スペース",
  mentoring: "メンタリング・伴走",
  overseas: "海外展開支援",
  "talent-program": "起業家・人材育成",
};

const SECTOR_KEYWORDS = [
  "AI",
  "B2B",
  "CRM",
  "DX",
  "SaaS",
  "Web3",
  "クラウド",
  "ディープテック",
  "バイオ",
  "ハードウェア",
  "ライフテック",
  "研究開発",
  "省力化",
  "設備投資",
];

export function withAssetScreening(asset: Asset): Asset {
  if (asset.screening) return { ...asset, screening: asset.screening };
  return { ...asset, screening: deriveAssetScreening(asset) };
}

export function deriveAssetScreening(asset: Asset): AssetScreening {
  const effort = getEffort(asset);
  return {
    lastCheckedAt: SCREENING_CHECKED_AT,
    sources: [{ checkedAt: SCREENING_CHECKED_AT, label: "公式サイト", url: asset.url }],
    fit: {
      summary: asset.eligibility ?? "公式サイトで対象者を要確認",
      stages: [...asset.stages],
      region: asset.region,
      founderTypes: getFounderTypes(asset),
      sectors: getSectors(asset),
      companyAge: getCompanyAge(asset),
      locationRequirements: getLocationRequirements(asset),
    },
    benefit: {
      summary: asset.value ?? asset.summary,
      amount: getAmount(asset),
      nonCash: getNonCashBenefits(asset.assetTypes),
    },
    effort,
    risk: {
      level: getRiskLevel(asset),
      notes: getRiskNotes(asset),
    },
  };
}

function getAmount(asset: Asset): ScreeningAmount | undefined {
  const text = [asset.value, asset.summary].filter(Boolean).join(" ");
  const maxAmountJpy = getMaxYenAmount(text);
  const original = getOriginalAmount(text);
  const subsidyRate = text.match(/(?:助成率|補助率)[:：]?\s*([0-9]+\/[0-9]+)/)?.[1];
  if (!maxAmountJpy && !original && !subsidyRate) return undefined;
  return {
    label: asset.value ?? original ?? "金額は公式サイトで要確認",
    maxAmountJpy,
    original,
    repayable: asset.assetTypes.includes("funding"),
    subsidyRate,
  };
}

function getMaxYenAmount(text: string): number | undefined {
  const amounts = [...text.matchAll(/([0-9,]+(?:\.[0-9]+)?)\s*(億|万)?円/g)].map(
    ([, raw, unit]) => {
      const base = Number(raw.replaceAll(",", ""));
      if (unit === "億") return base * 100_000_000;
      if (unit === "万") return base * 10_000;
      return base;
    },
  );
  return amounts.length > 0 ? Math.max(...amounts) : undefined;
}

function getOriginalAmount(text: string): string | undefined {
  const dollar = text.match(/\$\s*([0-9,]+)|([0-9,]+)\s*(?:米ドル|ドル|USD)/i);
  if (!dollar) return undefined;
  return dollar[1] ? `$${dollar[1]}` : `${dollar[2]}ドル`;
}

function getFounderTypes(asset: Asset): string[] {
  const text = getAssetText(asset);
  return unique([
    text.includes("女性") ? "女性起業家" : undefined,
    text.includes("学生") ? "学生" : undefined,
    text.match(/研究者|研究シーズ|大学|アカデミア/) ? "研究者・大学関係者" : undefined,
    text.match(/若者|若手|25歳|17歳/) ? "若手" : undefined,
    text.includes("個人") ? "個人応募可" : undefined,
    text.includes("法人") ? "法人可" : undefined,
  ]);
}

function getSectors(asset: Asset): string[] {
  const text = getAssetText(asset);
  return unique([
    ...(asset.tags ?? []).filter((tag) => SECTOR_KEYWORDS.includes(tag)),
    ...SECTOR_KEYWORDS.filter((keyword) => text.includes(keyword)),
  ]);
}

function getCompanyAge(asset: Asset): string | undefined {
  const text = getAssetText(asset);
  return (
    text.match(/(?:創業|設立|事業を始めてから)[^。、]*?(?:[0-9０-９]+年未満|[0-9０-９]+年以内)/)
      ?.[0] ?? undefined
  );
}

function getLocationRequirements(asset: Asset): string[] {
  if (!asset.region || /全国|グローバル/.test(asset.region)) return [];
  const compact = asset.region.replace(/[（(].*?[）)]/g, "");
  return unique(compact.split(/[→/／・,、]/).map((item) => item.trim()));
}

function getNonCashBenefits(types: AssetType[]): string[] {
  return unique(
    types
      .map((type) => BENEFIT_LABELS[type])
      .filter((label): label is string => Boolean(label)),
  );
}

function getEffort(asset: Asset): AssetScreening["effort"] {
  if (asset.assetTypes.includes("grant-subsidy")) return grantEffort();
  if (asset.assetTypes.includes("funding")) return fundingEffort();
  if (asset.assetTypes.includes("equity-investment")) return equityEffort();
  if (asset.assetTypes.includes("accelerator")) return acceleratorEffort();
  if (asset.assetTypes.includes("cloud-credit")) return cloudEffort();
  return communityEffort(asset);
}

function grantEffort(): AssetScreening["effort"] {
  return effort("high", "数日〜数週間", [
    "事業計画書",
    "経費見積・資金計画",
    "登記・本人確認・納税等の証憑",
    "電子申請フォーム",
  ], ["電子申請", "書類審査", "採択/交付審査", "実績報告・精算"], true);
}

function fundingEffort(): AssetScreening["effort"] {
  return effort("high", "数日〜数週間", [
    "事業計画書",
    "資金繰り表",
    "本人確認・登記・決算/税務資料",
  ], ["申込", "面談", "審査", "契約"]);
}

function equityEffort(): AssetScreening["effort"] {
  return effort("high", "数週間〜数か月", [
    "ピッチ資料",
    "事業計画・財務計画",
    "チーム/資本政策資料",
  ], ["応募/紹介", "面談", "投資審査", "条件交渉"]);
}

function acceleratorEffort(): AssetScreening["effort"] {
  return effort("medium", "数日〜数週間", [
    "申請フォーム",
    "ピッチ資料",
    "プロダクト/事業概要",
  ], ["応募", "書類審査", "面談/ピッチ", "採択後プログラム参加"]);
}

function cloudEffort(): AssetScreening["effort"] {
  return effort("low", "数時間〜数日", [
    "オンライン申請フォーム",
    "会社/プロダクト情報",
    "パートナー紹介情報（必要な場合）",
  ], ["オンライン申請", "資格確認", "クレジット付与"]);
}

function communityEffort(asset: Asset): AssetScreening["effort"] {
  const level: ScreeningEffort = asset.assetTypes.includes("free-office") ? "medium" : "low";
  return effort(level, "数時間〜数日", [
    "申請フォーム",
    "活動内容の説明",
  ], ["申込/登録", "必要に応じて面談", "利用開始"]);
}

function effort(
  level: ScreeningEffort,
  timeCommitment: string,
  requiredDocuments: string[],
  selectionSteps: string[],
  reimbursementOnly?: boolean,
): AssetScreening["effort"] {
  return { level, requiredDocuments, reimbursementOnly, selectionSteps, timeCommitment };
}

function getRiskLevel(asset: Asset): ScreeningRisk {
  if (asset.equity === "required" || asset.assetTypes.includes("funding")) return "high";
  if (asset.assetTypes.includes("grant-subsidy")) return "high";
  if (asset.equity === "optional" || asset.assetTypes.includes("overseas")) return "medium";
  return "low";
}

function getRiskNotes(asset: Asset): string[] {
  return unique([
    "募集条件・締切・金額は公式サイトで最終確認",
    asset.equity === "required" ? "株式取得や投資条件の確認が必要" : undefined,
    asset.equity === "optional" ? "支援内容により株式取得の可能性あり" : undefined,
    asset.assetTypes.includes("grant-subsidy")
      ? "補助金・助成金は原則として後払い/精算で、証憑管理が必要"
      : undefined,
    asset.assetTypes.includes("funding") ? "返済条件・金利・保証条件の確認が必要" : undefined,
    asset.assetTypes.includes("cloud-credit") ? "クレジットの有効期限と対象サービスを確認" : undefined,
    asset.assetTypes.includes("overseas") ? "渡航、現地法人、税務、ビザ等の制約を確認" : undefined,
  ]);
}

function getAssetText(asset: Asset): string {
  return [
    asset.name,
    asset.operator,
    asset.region ?? "",
    asset.value ?? "",
    asset.eligibility ?? "",
    asset.summary,
    ...asset.assetTypes.map((type) => ASSET_TYPE_LABELS[type]),
    ...(asset.tags ?? []),
  ].join(" ");
}

function unique(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
