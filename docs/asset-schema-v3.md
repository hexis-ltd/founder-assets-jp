# Asset Schema v3 Proposal

このデータセットの主用途は「起業家が自分に使える支援を探し、比較し、次の行動を決める」こと。現在の `Asset` は検索には使えるが、比較・意思決定・更新管理には情報が粗い。

起業家の一次判断は次の3つに集約する。

- `fit`: 自分が使えるか。対象者、地域、フェーズ、業種、法人/個人、創業年数。
- `effort`: 申請にどの程度の手間とコストがかかるか。締切、申請工数、必要書類、面談/ピッチ、自己負担、株式取得。
- `return`: どの程度のリターンがあるか。金額、クレジット額、期間、無償提供、ネットワーク、採択後の機会。

## 現状の課題

- `value` が自由文なので、金額上限・割引額・期間・現物支援を比較できない。
- `region` が自由文なので、都道府県、全国、海外展開先を機械的に扱いにくい。
- `eligibility` が自由文なので、法人/個人、創業年数、所在地、技術領域、女性起業家などの条件で絞れない。
- `application` は締切表示には十分だが、申請URL、採択時期、事前登録、説明会などの実務情報を持てない。
- 情報源と確認日がデータセット全体に寄っており、各アセット単位の鮮度・根拠が分からない。

## v3で分けたい主要ブロック

```ts
interface AssetV3 {
  id: string;
  name: string;
  operator: OrganizationRef;
  officialUrl: string;
  sourceUrls: SourceRef[];
  lastVerifiedAt: string;
  support: SupportProfile;
  target: TargetProfile;
  application: ApplicationProfile;
  effort: EffortProfile;
  geography: GeographyProfile;
  summary: string;
  tags: string[];
}
```

## 比較に効く構造化候補

```ts
interface SupportProfile {
  types: AssetType[];
  equity: Equity;
  cash?: {
    kind: "grant" | "subsidy" | "loan" | "investment" | "prize";
    maxAmountJpy?: number;
    subsidyRate?: string;
    repayable: boolean;
  };
  credits?: {
    provider: string;
    valueJpy?: number;
    valueOriginal?: string;
    durationMonths?: number;
  }[];
  nonCashBenefits: string[];
}

interface TargetProfile {
  stages: Stage[];
  founderTypes: ("student" | "women" | "researcher" | "foreign-founder")[];
  companyAgeMonthsMax?: number;
  requiredLocation?: string[];
  sectors: string[];
  eligibilityText: string;
}

interface ApplicationProfile {
  status: ApplicationStatus;
  applyUrl?: string;
  deadline?: string;
  opensAt?: string;
  cycle?: "rolling" | "annual" | "semiannual" | "quarterly" | "irregular";
  effortLevel?: "low" | "medium" | "high";
  selectionSteps: string[];
  note?: string;
}

interface EffortProfile {
  level?: "low" | "medium" | "high";
  applicationFeeJpy?: number;
  expectedHours?: number;
  requiredDocuments: string[];
  hasInterview?: boolean;
  hasPitch?: boolean;
  reimbursementOnly?: boolean;
  costNote?: string;
}

interface GeographyProfile {
  availability: "nationwide" | "local" | "overseas" | "global";
  prefectures: string[];
  countries: string[];
  city?: string;
}

interface SourceRef {
  url: string;
  title?: string;
  checkedAt: string;
}
```

## 移行方針

1. 現行 `Asset` を壊さず、`sourceUrls`, `lastVerifiedAt`, `support`, `target`, `geography` を任意フィールドで追加する。
2. 検証スクリプトに「v3フィールドがある場合だけ厳密検証」を追加する。
3. UIはまず `support.cash.maxAmountJpy`, `application.applyUrl`, `target.founderTypes`, `geography.prefectures` だけを見る。
4. 20件程度を手でv3化して、検索・フィルターの有用性を確認してから全件移行する。

## UIに効く優先フィールド

- `application.applyUrl`: 公式サイトトップではなく応募ページへ送る。
- `support.cash.maxAmountJpy`: 金額で比較・並び替えできる。
- `effort.level` / `effort.expectedHours`: 「申請する価値があるか」の初期判断に使う。
- `effort.requiredDocuments`: 事業計画書、見積書、登記簿、決算書などの準備負荷を出す。
- `support.equity`: 既存維持。かなり重要。
- `target.founderTypes`: 女性起業家、学生、研究者などを検索語依存から外す。
- `geography.prefectures` / `geography.countries`: 地域フィルターを自由文から脱出させる。
- `lastVerifiedAt`: 古い情報の警告表示に使う。
