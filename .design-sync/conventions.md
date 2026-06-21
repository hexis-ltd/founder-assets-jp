## Founder Assets JP — 使い方の規約

これは日本のスタートアップ支援アセット横断データベース（Next.js App Router アプリ）から
切り出した4つのコンポーネントです。汎用UIキットではなく、この製品の画面パーツです。

### ラッピングと前提
- **すべて props 駆動・データ取得はしない。** ホスト側が `assets` / `user` / `initialStates` と
  コールバック（`onUserStatusChange` など）を渡す。コンポーネント内部に fetch やDB呼び出しはない。
- **`AuthForm` / `AuthPanel` / `Directory` は Next.js App Router のクライアントコンポーネント**で、
  `next/navigation` の `useRouter` / `usePathname` / `useSearchParams` を描画時に呼ぶ。
  通常の Next.js App Router 配下なら自動で動く（特別なプロバイダ不要）。App Router 外で使うと
  これらのフックが投げる。`AssetCard` は router 非依存で単体で使える。
- `AuthForm`/`AuthPanel` は `<a href="/api/auth/...">` や `/signin` への遷移を前提にする。
  認証APIルート（`/api/auth/login` 等）はこの製品側の実装に依存する。

### スタイルの作法（Tailwind v4 + CSS変数トークン）
CSSクラスはすべて **Tailwind v4 のユーティリティ**。色はハードコードせず、ブランドの
**CSS変数トークン**を arbitrary-value ユーティリティで参照するのがこのDSの作法:

| トークン | 用途 |
|---|---|
| `--color-bg` | ページ/入力の背景 |
| `--color-surface` | カード等の面の背景 |
| `--color-surface-2` | 一段沈んだ面・ホバー背景 |
| `--color-muted-soft` | タグ/チップの薄い背景 |
| `--color-border` | 境界線（`border-[var(--color-border)]`） |
| `--color-text` | 主要テキスト・主ボタンの地色 |
| `--color-muted` | 補助テキスト |

使い方の例: `bg-[var(--color-surface)]`、`text-[var(--color-text)]`、
`border border-[var(--color-border)]`。ステータス系の色（募集状況・エクイティ・手間レベル）は
Tailwind 標準パレットの `emerald` / `amber` / `rose` / `sky`（`50`/`200`/`700`系）を
`border-* bg-* text-*` の3点セットで使う。角丸は `rounded-md`/`rounded-lg`/`rounded-full`、
余白は `gap-*`/`px-*`/`py-*`。和文を含むため行間は `leading-snug`/`leading-relaxed` を多用。

### 一次情報の在りか
- 配色トークンとユーティリティの実体は同梱の **`styles.css`**（`_ds_bundle.css` と
  コンパイル済みTailwindを `@import`）。新しい色を発明する前にここを読むこと。
- 各コンポーネントのAPIは `<Name>.d.ts`（props 契約）、使い方は `<Name>.prompt.md`。

### 典型的な組み立て例
```tsx
import { AssetCard } from "<pkg>";

// ホストが用意したデータとコールバックを渡し、レイアウトは Tailwind + トークンで組む
<section className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
  <h2 className="text-base font-semibold text-[var(--color-text)]">注目の支援</h2>
  <AssetCard
    asset={asset}
    canTrack={false}
    saving={false}
    onUserStatusChange={() => {}}
  />
</section>
```
