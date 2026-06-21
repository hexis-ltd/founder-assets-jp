// Authored preview for Directory — composition only (real shipped component).
// Usage ported from app/page.tsx (<Directory assets={...} initialStates={...} user={...} />).
// Directory is the full directory view: a filter bar plus a card grid. It is a
// wide, page-level component — rendered with cardMode "single" + a large
// viewport (see cfg.overrides.Directory) so the whole layout fits the card.
import { Directory } from "founder-assets-jp";

const assets = [
  {
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
  },
  {
    id: "foundx-founders",
    name: "FoundX Founders Program",
    operator: "東京大学 産学協創推進本部",
    region: "東京（本郷）",
    assetTypes: ["free-office", "community", "mentoring"],
    stages: ["idea", "seed"],
    equity: "none",
    application: { status: "rolling", note: "随時エントリー・選考（チーム単位）" },
    value: "個室オフィス最大9ヶ月・無償・非エクイティ",
    eligibility: "東京大学の卒業生・研究者など関係者",
    summary:
      "東大FoundXが提供する、すでにアイデアを持つチーム向けの最大9ヶ月の無償プログラム。個室と起業家コミュニティを提供。",
    url: "https://foundx.jp/",
    tags: ["東大", "大学発"],
  },
  {
    id: "onlab",
    name: "Open Network Lab（Onlab）",
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
  },
  {
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
  },
];

/** 一覧の既定表示：フィルタバー＋カードグリッド。未ログインなので各カードはサインイン誘導 */
export function Default() {
  return <Directory assets={assets} initialStates={[]} user={null} />;
}
