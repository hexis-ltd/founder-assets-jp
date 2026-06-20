import {
  type Asset,
  ASSET_TYPE_LABELS,
  STAGE_LABELS,
  getStatusDisplay,
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
  return: DecisionItem[];
};

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

export function getAssetDecisionProfile(
  asset: Asset,
  now?: Date,
): AssetDecisionProfile {
  const status = getStatusDisplay(asset.application, now);
  const effortLevel = getEffortLevel(asset);
  return {
    effort: [
      { label: "申請", value: `${status.label} / ${status.detail}` },
      { label: "手間", value: effortLevel.detail },
      { label: "コスト", value: getEquityCostLabel(asset.equity) },
      ...optionalApplicationNotes(asset),
    ],
    effortLevel,
    fit: [
      { label: "対象", value: asset.eligibility ?? "公式サイトで要確認" },
      {
        label: "フェーズ",
        value: asset.stages.map((stage) => STAGE_LABELS[stage]).join(" / "),
      },
      { label: "地域", value: asset.region ?? "要確認" },
    ],
    return: [
      { label: "リターン", value: asset.value ?? asset.summary },
      {
        label: "支援内容",
        value: asset.assetTypes.map((type) => ASSET_TYPE_LABELS[type]).join(" / "),
      },
    ],
  };
}

function getEquityCostLabel(equity: Asset["equity"]): string {
  if (equity === "none") return "株式取得なし";
  if (equity === "optional") return "株式取得の可能性あり";
  return "株式取得あり";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function getEffortLevel(asset: Asset): EffortLevel {
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

function optionalApplicationNotes(asset: Asset): DecisionItem[] {
  return [
    asset.application.window
      ? { label: "募集周期", value: asset.application.window }
      : undefined,
    asset.application.note
      ? { label: "注意", value: asset.application.note }
      : undefined,
  ].filter((item): item is DecisionItem => Boolean(item));
}
