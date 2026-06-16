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

// 申込タイミング種別
export type TimingType =
  | "always" // 通年・常時
  | "periodic" // 期別募集（年複数回）
  | "annual" // 年1回前後
  | "varies"; // 不定期・要確認

export interface Asset {
  id: string;
  name: string;
  nameEn?: string;
  operator: string; // 運営主体
  assetTypes: AssetType[];
  stages: Stage[];
  equity: Equity;
  timingType: TimingType;
  timing: string; // 申込時期の説明（自由記述）
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

export const TIMING_LABELS: Record<TimingType, string> = {
  always: "通年",
  periodic: "期別募集",
  annual: "年1回前後",
  varies: "不定期/要確認",
};
