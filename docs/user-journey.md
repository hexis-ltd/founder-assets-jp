# Founder User Journey

## Primary persona

日本で起業中、または起業準備中の founder。時間は少なく、制度名には詳しくない。探しているのは「制度一覧」ではなく、自分が使うべき支援の候補。

## Core journey

| Step | Founder question | UI responsibility | Data responsibility |
| --- | --- | --- | --- |
| 1. Search | 自分に関係ある支援はあるか | Searchを最上部に固定し、結果数を即時表示 | name/operator/summary/tags/eligibilityを検索対象にする |
| 2. Narrow | 候補を減らせるか | Filterはtoggleでまとめ、適用中条件を常に表示 | type/stage/equity/status/regionを安定enum化 |
| 3. Evaluate fit | 自分が使えるか | Cardで対象・フェーズ・地域を最初に見せる | eligibility/geography/targetを構造化 |
| 4. Estimate effort | 申請するだけの余裕があるか | 手間・締切・株式取得有無を同じ場所に出す | requiredDocuments/expectedHours/applicationFeeを追加 |
| 5. Estimate return | 見返りは十分か | 金額・クレジット・提供価値を太く見せる | maxAmountJpy/creditValue/supportBenefitsを追加 |
| 6. Act | 次に何をすればいいか | 公式リンクと保存状態を近接配置 | applyUrl/sourceUrls/lastVerifiedAtを追加 |

## UX implications

- Search and filters are not separate modes. They should compose through URL params.
- Filter categories should be visible only when needed, but active filters must remain visible.
- Cards should not force founders to infer value from tags. The card must translate data into decision language.
- Unknown effort/cost should be honest. It is better to say `要確認` than to imply precision.

## Anti-goals

- Do not lead with dataset statistics.
- Do not create a landing-page narrative before the search workflow.
- Do not make founders understand internal schema terms before they can evaluate an asset.
