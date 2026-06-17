// ============================================================
// スキーマ v2
// ユーザーの一次ニーズ「いま応募できるか／締切はいつか」を
// 構造化して必須化し、締切順ソートを成立させるための設計。
// ============================================================

// 提供アセット種別
export type AssetType =
  | "free-office" // 無料/格安オフィス・スペース
  | "cloud-credit" // クラウド・SaaSクレジット
  | "funding" // 融資・資金供給
  | "equity-investment" // エクイティ出資
  | "grant-subsidy" // 補助金・助成金（非返済）
  | "mentoring" // メンタリング・伴走支援
  | "talent-program" // 人材発掘・育成
  | "community" // コミュニティ・ネットワーク
  | "overseas" // 海外展開支援
  | "accelerator"; // アクセラレーター（複合）

// 対象フェーズ
export type Stage =
  | "idea" // 創業前・アイデア
  | "seed" // シード
  | "early" // アーリー
  | "growth" // グロース
  | "any"; // フェーズ不問

// エクイティ有無
export type Equity =
  | "none" // 株式取得なし（非エクイティ）
  | "optional" // 任意・場合により
  | "required"; // 出資（株式取得あり）

// 募集ステータス（締切の性質を型で表現する）
export type ApplicationStatus =
  | "open" // 現在募集中（締切日あり）
  | "upcoming" // 募集予定（開始日が判明）
  | "rolling" // 通年・常時応募可（締切なし）
  | "recurring" // 定期募集（年次/期別。次回の具体日は未確定）
  | "closed"; // 現在募集なし（次回未定・選定制など）

// 応募情報（必須）。status は必ず持ち、状況に応じて日付/周期を補う。
export interface Application {
  status: ApplicationStatus;
  deadline?: string; // ISO日付 "2026-10-08"。status=open のとき設定
  opensAt?: string; // ISO日付。status=upcoming のとき設定
  window?: string; // 人間可読の周期。例「毎年11月〜翌3月に公募」
  note?: string; // 補足（年度・選定方法など）
}

export interface Asset {
  id: string;
  name: string;
  nameEn?: string;
  operator: string; // 運営主体
  region?: string; // 地域（全国/東京/福岡 など）
  assetTypes: AssetType[];
  stages: Stage[];
  equity: Equity;
  application: Application; // ← 必須化した募集情報
  value?: string; // 提供価値の規模感
  eligibility?: string; // 対象者の条件
  summary: string;
  url: string;
  tags?: string[];
}

// ---- ラベル定義（UI表示用） ----

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  "free-office": "無料オフィス",
  "cloud-credit": "クラウド/SaaSクレジット",
  funding: "融資・資金供給",
  "equity-investment": "エクイティ出資",
  "grant-subsidy": "補助金・助成金",
  mentoring: "メンタリング",
  "talent-program": "人材発掘・育成",
  community: "コミュニティ",
  overseas: "海外展開",
  accelerator: "アクセラレーター",
};

export const STAGE_LABELS: Record<Stage, string> = {
  idea: "創業前・アイデア",
  seed: "シード",
  early: "アーリー",
  growth: "グロース",
  any: "フェーズ不問",
};

export const EQUITY_LABELS: Record<Equity, string> = {
  none: "非エクイティ",
  optional: "任意/場合により",
  required: "出資（株式取得）",
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  open: "募集中",
  upcoming: "募集予定",
  rolling: "通年募集",
  recurring: "定期募集",
  closed: "募集終了",
};

// ---- 締切ソート / 表示ロジック ----

// 締切が近い順に並べるためのバケット重み（小さいほど上位）。
const STATUS_BUCKET: Record<ApplicationStatus, number> = {
  open: 0, // 今すぐ応募でき、締切が迫るものを最上位に
  upcoming: 1, // 近く開く（カレンダー登録向け）
  rolling: 2, // いつでも応募可（緊急性なし）
  recurring: 3, // 次サイクル待ち
  closed: 4, // 現在応募不可
};

function dateMs(iso?: string): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

// 締切順の比較関数（now に依存しない＝SSRとクライアントで一致）
export function compareByDeadline(a: Asset, b: Asset): number {
  const ba = STATUS_BUCKET[a.application.status];
  const bb = STATUS_BUCKET[b.application.status];
  if (ba !== bb) return ba - bb;
  // open は締切昇順、upcoming は開始日昇順
  if (a.application.status === "open") {
    return dateMs(a.application.deadline) - dateMs(b.application.deadline);
  }
  if (a.application.status === "upcoming") {
    return dateMs(a.application.opensAt) - dateMs(b.application.opensAt);
  }
  return a.name.localeCompare(b.name, "ja");
}

export interface StatusDisplay {
  label: string;
  detail: string;
  tone: "danger" | "warn" | "ok" | "rolling" | "muted";
  daysLeft?: number;
}

function formatJaDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// now を渡すと締切までの残日数を計算（クライアントのマウント後のみ渡す）。
export function getStatusDisplay(app: Application, now?: Date): StatusDisplay {
  switch (app.status) {
    case "open": {
      const detailBase = app.deadline
        ? `締切 ${formatJaDate(app.deadline)}`
        : "募集中";
      if (now && app.deadline) {
        const days = Math.ceil(
          (new Date(app.deadline).getTime() - now.getTime()) / 86_400_000,
        );
        const tone = days <= 7 ? "danger" : days <= 30 ? "warn" : "ok";
        const suffix =
          days < 0
            ? "（締切超過）"
            : days === 0
              ? "（本日締切）"
              : `（あと${days}日）`;
        return {
          label: "募集中",
          detail: `${detailBase}${suffix}`,
          tone,
          daysLeft: days,
        };
      }
      return { label: "募集中", detail: detailBase, tone: "ok" };
    }
    case "upcoming": {
      const parts: string[] = [];
      if (app.opensAt) parts.push(`${formatJaDate(app.opensAt)} 開始`);
      if (app.deadline) parts.push(`締切 ${formatJaDate(app.deadline)}`);
      return {
        label: "募集予定",
        detail: parts.join(" ・ ") || app.window || "募集予定",
        tone: "warn",
      };
    }
    case "rolling":
      return {
        label: "通年募集",
        detail: app.note || "常時応募可",
        tone: "rolling",
      };
    case "recurring":
      return {
        label: "定期募集",
        detail: app.window || "次回時期は要確認",
        tone: "muted",
      };
    case "closed":
      return {
        label: "募集終了",
        detail: app.window || app.note || "次回未定",
        tone: "muted",
      };
  }
}
