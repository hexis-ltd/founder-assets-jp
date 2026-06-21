# design-sync NOTES — founder-assets-jp

このリポジトリは**デザインシステムではなく単一の Next.js プロダクト**。design-sync の
package shape を「全部同期」で無理やり通している。次回同期者はこの前提を理解しておくこと。

## 同期しているもの
`components/` の公開コンポーネント4つだけ:
- `AssetCard` — 支援制度カード（純表示。ルーター非依存）
- `AuthForm` — サインイン/サインアップフォーム
- `AuthPanel` — ヘッダーの認証パネル
- `Directory` — アセット一覧（フィルタ付き、最も重い）

## 重要なセットアップ事項

- **dist もライブラリエントリも無い。** `package.json` に `main`/`module`/`exports` 無し。
  synth-from-src だと PKG_DIR が `node_modules/founder-assets-jp`（存在しない）になり破綻する。
  そのため `.design-sync/ds-entry.ts` を `--entry` に渡し、そこから package.json を遡って
  PKG_DIR=リポジトリルートにしている。コンポーネントは `cfg.componentSrcMap` で明示ピン。
- **`cfg.srcDir = "components"` は必須。** デフォルト探索順は src→lib→components で、この
  リポジトリは `lib/` が存在するため未指定だと `lib/` を走査してしまう。
- **CSS は Tailwind v4。** `app/globals.css` は `@import "tailwindcss";` ディレクティブを含み
  そのままでは styles.css のインポート閉包が壊れる。`cfg.buildCmd` で
  `@tailwindcss/cli`（`.ds-sync` に隔離インストール、版は repo 一致の 4.1.11）を使い
  `app/globals.css` を `.design-sync/compiled.css` にコンパイルし、`cssEntry` をそれに向ける。
  - **再同期時は CSS を必ず再コンパイル**（`cfg.buildCmd`）。`compiled.css` は gitignore 済み（生成物）。
  - **`@tailwindcss/cli@4.1.11` をコンバーター依存と一緒に入れること**:
    `(cd .ds-sync && npm i esbuild ts-morph @types/react @tailwindcss/cli@4.1.11)`
  - Tailwind v4 のコンテンツ自動検出は cwd（リポジトリルート）基準。`components/` と
    `.design-sync/previews/` を拾う。**プレビューのクラスを変えたら CSS を再コンパイルしてから再ビルド**。
- **プロバイダ必須。** `AuthForm`/`AuthPanel`/`Directory` は `next/navigation` のフックを
  描画時に呼ぶ。`.design-sync/ds-provider.tsx` の `DesignProvider` が
  `AppRouterContext` / `PathnameContext` / `SearchParamsContext`（`next/dist/shared/lib/...`）を
  inert な値で供給する。`extraEntries` でバンドルに載せ、`cfg.provider` で全プレビューを包む。
  Next のバージョンを上げたらこれらの dist パスが変わる可能性があるので確認すること。

## ビルドで踏んだ落とし穴（解決済み・再同期で再発しうる）

- **`process is not defined`**: ブラウザ向けバンドルで Next 内部が `process.env.__NEXT_*` 等を参照する。
  コンバーターは `process.env.NODE_ENV` だけ define するので他の参照で落ちる。
  → `.design-sync/ds-process-shim.ts` を `extraEntries` の**先頭**に置き、inert な `process` を
  バンドル初期化時に注入して解決。先頭順序が重要（Next モジュールより先に評価される必要がある）。
- **props が自動抽出されない**: dist も `.d.ts` も無く、インラインの分割代入 props 型なので
  コンバーターは `{ [key: string]: unknown }` しか出さない。→ `cfg.dtsPropsFor` で全4件の props を
  手書き（`lib/types.ts` の `Asset` 等を inline して自己完結させた）。`lib/types.ts` の型が変わったら追従要。
- **フォント**: `app/globals.css` の body フォントスタックは全て OS のシステムフォント
  （Hiragino / Noto Sans JP / Yu Gothic UI / system-ui …）で、独自ブランドフォントは無い。
  `[FONT_MISSING]` は `cfg.runtimeFontPrefixes` で抑制（実行環境のフォントで描画する意図）。
  代替フォントを承諾したのではなく、元から OS フォント前提の設計。
- **`docs/*.md` の混入**: デフォルトの `guidelinesGlob` は `docs/*.md` を拾うが、これは製品/開発の
  内部ドキュメント（スキーマ・改善計画等）でデザインガイドではない。`guidelinesGlob` を
  存在しないパスにして除外済み。
- **Directory は `cardMode: "single"`**: ページ全体（検索バー+グリッド）なので `cfg.overrides` で
  single + 大きめビューポートにしている。

## Re-sync risks（次回が静かに壊れうる点）
- **Next のアップグレード**: `ds-provider.tsx` の `next/dist/shared/lib/*.shared-runtime` パスは
  内部 API。メジャー更新で移動・改名されうる。プレビューが軒並み「context」エラーになったら最初に疑う。
- **CSS の再コンパイル漏れ**: `compiled.css` は生成物（gitignore）。再同期で `buildCmd` を
  回さないと古い/欠落したスタイルでアップロードされる。
- **コンポーネント追加**: `components/` に公開コンポーネントを足したら `componentSrcMap` に追記要。
- **これらは全てプロダクト固有部品**。デザインエージェントが組めるのはこの製品の画面パーツのみ。
