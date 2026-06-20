# Screening Schema Gap

founder がアセットを一次スクリーニングするときは、単に「存在する制度」ではなく「自分が使えるか」「申請する価値があるか」「どんな制約があるか」を短時間で判断できる必要がある。

## 現行スキーマとの差分

| 見る情報 | v2の表現 | 不足 | 今回の対応 |
| --- | --- | --- | --- |
| 基本情報・根拠 | `name`, `operator`, `url`, dataset-wide `LAST_CHECKED` | アセット単位の根拠URL・確認日 | `screening.sources`, `screening.lastCheckedAt` |
| 対象 founder | `stages`, `region`, `eligibility` | founder属性、業種、所在地要件、創業年数を検索しにくい | `screening.fit` |
| 提供価値 | `assetTypes`, `value` | 金額上限、補助率、非金銭メリットを比較しにくい | `screening.benefit` |
| 経済条件 | `equity` | 返済・後払い・精算リスクが見えにくい | `screening.benefit.amount.repayable`, `screening.risk` |
| 応募負荷 | `application` と型ベース推定 | 必要書類、選考ステップ、時間目安がない | `screening.effort` |
| リスク・制約 | なし | equity、後払い、海外・クレジット期限などを別途読む必要がある | `screening.risk` |

## 実装方針

- 既存の `Asset` を壊さず、任意フィールド `screening` を追加する。
- `lib/data.ts` の既存データを `withAssetScreening()` で拡張して、静的データ・export・DB seed では常に `screening` を持たせる。
- 金額や必要書類は公式URLと既存の `value` / `eligibility` / `assetTypes` から保守的に派生する。
- 個別制度の締切・金額・条件は変動するため、確定日以外は `window` / `note` / `risk.notes` に残す。

## 今回公式情報で更新したもの

- 東京都 創業助成事業: 令和8年度第2回の受付期間と公式URLを更新。
- 中小企業省力化投資補助金（一般型）: 第7回の公募開始・受付予定・締切予定を更新。
- 小規模事業者持続化補助金（創業型）: 第4回の受付期間と公式URLを更新。
