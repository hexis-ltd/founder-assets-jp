// Authored preview for AssetCard — composition only (real shipped component).
// Data ported from lib/data.ts (real curated assets); the "open" card uses a
// real grant in an open round to exercise the deadline-countdown path, which
// the curated dataset rarely carries (deadlines are volatile, see AGENTS.md).
import { AssetCard } from "founder-assets-jp";

const noop = () => {};

const flap = {
  id: "flap",
  name: "FLAP",
  operator: "mint（旧 Apricot Ventures）",
  region: "東京（渋谷）",
  assetTypes: ["free-office", "community", "mentoring"],
  stages: ["idea", "seed"],
  equity: "none",
  application: { status: "recurring", window: "おおむね2〜3ヶ月ごとに新しい期を募集" },
  value: "渋谷の無料オフィスを約6ヶ月＋メンタリング",
  eligibility: "創業準備中〜創業期の起業家",
  summary:
    "創業前/創業期に特化したVC mintが運営する無料オフィス支援プログラム。期ごとに選抜チームへ約6ヶ月間オフィスとコミュニティを無償提供する。",
  url: "https://mint-vc.com/",
  tags: ["渋谷", "プレシード"],
} as const;

const onlab = {
  id: "onlab",
  name: "Open Network Lab（Onlab）",
  nameEn: "Onlab",
  operator: "デジタルガレージ",
  region: "全国",
  assetTypes: ["accelerator", "equity-investment", "mentoring"],
  stages: ["seed"],
  equity: "required",
  application: { status: "recurring", window: "Seed Accelerator は年複数回のバッチ" },
  value: "出資＋約3〜4ヶ月の集中支援＋デモデイ",
  eligibility: "シード期のスタートアップ",
  summary:
    "日本の草分け的シードアクセラレーター。少額出資と引き換えに集中メンタリングを行い、デモデイで投資家へ繋ぐ。",
  url: "https://onlab.jp/",
  tags: ["シード", "出資あり"],
} as const;

const monodukuri = {
  id: "monodukuri",
  name: "ものづくり補助金",
  operator: "中小企業庁",
  region: "全国",
  assetTypes: ["grant-subsidy"],
  stages: ["early", "growth"],
  equity: "none",
  application: { status: "open", deadline: "2026-07-10" },
  value: "設備投資・試作開発費を補助（上限あり）",
  eligibility: "中小企業・小規模事業者",
  summary:
    "革新的な製品・サービス開発や生産プロセス改善のための設備投資を支援する代表的な補助金。公募回ごとに締切が設定される。",
  url: "https://portal.monodukuri-hojo.jp/",
  tags: ["補助金", "設備投資"],
} as const;

/** 未ログイン時：進捗保存セレクトの代わりにサインイン誘導リンクが出る（非エクイティ・通年枠） */
export function SignedOut() {
  return (
    <AssetCard
      asset={flap}
      canTrack={false}
      saving={false}
      onUserStatusChange={noop}
    />
  );
}

/** ログイン済み・進捗トラッキング有効。出資ありアクセラレーターで「申請済み」を保存した状態 */
export function Tracked() {
  return (
    <AssetCard
      asset={onlab}
      canTrack
      saving={false}
      onUserStatusChange={noop}
      userState={{ assetId: onlab.id, status: "applied", updatedAt: "2026-06-01" }}
    />
  );
}

/** 募集中（status=open）で締切が近い補助金。now を渡すと残日数と緊張感のあるトーンが出る */
export function OpenDeadline() {
  return (
    <AssetCard
      asset={monodukuri}
      canTrack={false}
      saving={false}
      onUserStatusChange={noop}
      now={new Date("2026-06-21")}
    />
  );
}
