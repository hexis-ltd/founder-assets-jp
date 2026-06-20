import {
  type Asset,
  ASSET_TYPE_LABELS,
  STAGE_LABELS,
  type ScreeningEffort,
} from "./types";

export type DecisionItem = {
  label: string;
  value: string;
};

export type EffortLevel = {
  detail: string;
  label: "軽い" | "中" | "重い" | "要確認";
  tone: "low" | "medium" | "high" | "unknown";
};

export type AssetDecisionProfile = {
  effort: DecisionItem[];
  effortLevel: EffortLevel;
  fit: DecisionItem[];
  notes: string[];
  return: DecisionItem[];
};

const GENERIC_RISK_NOTE = "募集条件・締切・金額は公式サイトで最終確認";

const PREPARATION_LABELS: [string, string][] = [
  ["経費見積・資金計画", "経費見積"],
  ["登記・本人確認・納税等の証憑", "証憑"],
  ["オンライン申請フォーム", "申請フォーム"],
  ["電子申請フォーム", "申請フォーム"],
  ["会社/プロダクト情報", "会社情報"],
  ["パートナー紹介情報", "紹介情報"],
  ["プロダクト/事業概要", "事業概要"],
  ["チーム/資本政策資料", "資本政策"],
];

const FLOW_LABELS: [string, string][] = [
  ["採択/交付審査", "交付審査"],
  ["実績報告・精算", "精算"],
  ["必要に応じて面談", "面談"],
  ["採択後プログラム参加", "参加"],
  ["オンライン申請", "申請"],
  ["申込/登録", "申込"],
  ["資格確認", "確認"],
  ["クレジット付与", "付与"],
];

export function getApplicationTiming(asset: Asset): DecisionItem {
  const app = asset.application;
  if (app.status === "open") {
    return { label: "締切", value: app.deadline ? formatDate(app.deadline) : "要確認" };
  }
  if (app.status === "upcoming") {
    const parts = [
      app.opensAt ? `開始 ${formatDate(app.opensAt)}` : undefined,
      app.deadline ? `締切 ${formatDate(app.deadline)}` : undefined,
    ].filter((part): part is string => Boolean(part));
    return { label: "募集期間", value: parts.join(" ・ ") || "要確認" };
  }
  if (app.status === "rolling") {
    return { label: "締切", value: "随時受付" };
  }
  if (app.status === "recurring") {
    return { label: "締切", value: app.window ?? "次回要確認" };
  }
  return { label: "締切", value: app.window ?? app.note ?? "募集終了" };
}

export function getAssetDecisionProfile(asset: Asset): AssetDecisionProfile {
  const effortLevel = getEffortLevel(asset);
  return {
    effort: getEffortItems(asset, effortLevel),
    effortLevel,
    fit: [
      {
        label: "対象",
        value: asset.screening?.fit.summary ?? asset.eligibility ?? "公式サイトで要確認",
      },
      {
        label: "フェーズ",
        value: (asset.screening?.fit.stages ?? asset.stages)
          .map((stage) => STAGE_LABELS[stage])
          .join(" / "),
      },
      { label: "地域", value: asset.screening?.fit.region ?? asset.region ?? "要確認" },
    ],
    return: [
      {
        label: "リターン",
        value: asset.screening?.benefit.summary ?? asset.value ?? asset.summary,
      },
      {
        label: "支援内容",
        value: asset.assetTypes.map((type) => ASSET_TYPE_LABELS[type]).join(" / "),
      },
    ],
    notes: getNotes(asset),
  };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function getEffortLevel(asset: Asset): EffortLevel {
  const level = asset.screening?.effort.level;
  if (level) return toEffortLevel(level, asset.screening?.effort.timeCommitment);
  if (asset.assetTypes.some((type) => type === "cloud-credit")) {
    return {
      detail: "比較的軽い。オンライン申請で完結することが多い",
      label: "軽い",
      tone: "low",
    };
  }
  if (asset.assetTypes.some((type) => type === "grant-subsidy" || type === "funding")) {
    return {
      detail: "重い。事業計画、見積、証憑、審査対応が必要になりやすい",
      label: "重い",
      tone: "high",
    };
  }
  if (asset.assetTypes.some((type) => type === "accelerator" || type === "equity-investment")) {
    return {
      detail: "中〜重い。選考、面談、ピッチ準備が必要になりやすい",
      label: "重い",
      tone: "high",
    };
  }
  if (asset.assetTypes.some((type) => type === "mentoring" || type === "community")) {
    return {
      detail: "中。応募フォームや面談が必要な場合がある",
      label: "中",
      tone: "medium",
    };
  }
  return {
    detail: "制度ごとの差が大きいため公式サイトで要確認",
    label: "要確認",
    tone: "unknown",
  };
}

function getEffortItems(
  asset: Asset,
  effortLevel: EffortLevel,
): DecisionItem[] {
  return [
    { label: "手間", value: effortLevel.detail },
    { label: "準備", value: getPreparationLabel(asset) },
    { label: "流れ", value: getFlowLabel(asset) },
  ];
}

function getPreparationLabel(asset: Asset): string {
  const docs = asset.screening?.effort.requiredDocuments ?? inferRequiredDocuments(asset);
  return compactList(docs.map(compactPreparation), " / ");
}

function getFlowLabel(asset: Asset): string {
  const steps = asset.screening?.effort.selectionSteps ?? inferSelectionSteps(asset);
  return compactList(steps.map(compactFlow), " → ");
}

function getNotes(asset: Asset): string[] {
  return unique([
    asset.application.note,
    asset.screening?.effort.costNote,
    ...(asset.screening?.risk.notes ?? []).filter(
      (note) => note !== GENERIC_RISK_NOTE,
    ),
  ]);
}

function inferRequiredDocuments(asset: Asset): string[] {
  if (asset.assetTypes.includes("cloud-credit")) {
    return ["申請フォーム", "会社情報"];
  }
  if (asset.assetTypes.some((type) => type === "grant-subsidy" || type === "funding")) {
    return ["事業計画書", "経費見積", "証憑"];
  }
  if (asset.assetTypes.some((type) => type === "accelerator" || type === "equity-investment")) {
    return ["ピッチ資料", "事業計画", "チーム資料"];
  }
  return ["申請フォーム", "活動内容"];
}

function inferSelectionSteps(asset: Asset): string[] {
  if (asset.assetTypes.includes("cloud-credit")) {
    return ["申請", "確認", "付与"];
  }
  if (asset.assetTypes.includes("grant-subsidy")) {
    return ["電子申請", "審査", "交付", "精算"];
  }
  if (asset.assetTypes.includes("funding")) return ["申込", "面談", "審査", "契約"];
  if (asset.assetTypes.includes("equity-investment")) {
    return ["応募/紹介", "面談", "投資審査", "条件交渉"];
  }
  if (asset.assetTypes.includes("accelerator")) {
    return ["応募", "審査", "面談/ピッチ", "参加"];
  }
  return ["申込", "確認", "利用開始"];
}

function toEffortLevel(
  level: ScreeningEffort,
  timeCommitment?: string,
): EffortLevel {
  const suffix = timeCommitment ? `。目安: ${timeCommitment}` : "";
  if (level === "low") {
    return { detail: `比較的軽い${suffix}`, label: "軽い", tone: "low" };
  }
  if (level === "medium") {
    return { detail: `中程度${suffix}`, label: "中", tone: "medium" };
  }
  if (level === "high") {
    return { detail: `重い${suffix}`, label: "重い", tone: "high" };
  }
  return { detail: `制度ごとの差が大きい${suffix}`, label: "要確認", tone: "unknown" };
}

function compactPreparation(value: string): string {
  return compactWith(PREPARATION_LABELS, value);
}

function compactFlow(value: string): string {
  return compactWith(FLOW_LABELS, value);
}

function compactWith(labels: [string, string][], value: string): string {
  return labels.find(([needle]) => value.includes(needle))?.[1] ?? value;
}

function compactList(values: string[], separator: string): string {
  const items = unique(values).slice(0, 3);
  return items.join(separator);
}

function unique(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
