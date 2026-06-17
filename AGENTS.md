# AGENTS.md

Claude Code / Codex 等のエージェント向けガイド。**アセット（支援制度）の追加・編集はこの手順に従うこと。**

## データの流れ

```
lib/data.ts  ──(bun run db:setup)──▶  Neon DB (assets テーブル)
  ▲ 上流・Git管理する元データ            ▲ 実行時の読み取り先
```

- [lib/data.ts](lib/data.ts) が**唯一の元データ（ソース・オブ・トゥルース）**。アセットの追加・編集はここを直接編集する。
- DB（`assets` テーブル）は元データのコピー。`bun run db:setup` で `lib/data.ts` の内容を **upsert**（新規は挿入・既存は同IDで更新）する。破壊的操作はしない。
- DB未接続時はアプリが `lib/data.ts` にフォールバックする（[getAssets()](lib/db/assets.ts)）。**だから `lib/data.ts` を消してDBだけにしてはいけない。**

## アセット追加の手順

1. **`lib/data.ts` の `assets` 配列に追記する。** 既存エントリを例にして、同じ形で書く。型は [lib/types.ts](lib/types.ts) の `Asset` を参照。
2. **検証する。**
   ```bash
   bun run validate
   ```
   ID重複・enum外の値・日付形式・URL・`status`整合などをチェックする（[lib/asset-schema.ts](lib/asset-schema.ts)）。エラーが出たら直す。
3. **DBへ反映する。**（`DATABASE_URL` が必要。プロジェクトルートの `.env.local` にある）
   ```bash
   set -a && source .env.local && set +a && bun run db:setup
   ```
   `db:setup` は反映前に `validate` と同じ検証を再実行し、エラーがあれば反映を中止する。

> Git worktree で作業している場合、`.env.local` はメインのリポジトリ側にあることがある。その場合は `source /path/to/main-repo/.env.local` のように絶対パスで読み込む。

## データモデルの要点

`Asset` の必須/任意フィールドと enum 値は [lib/types.ts](lib/types.ts) が正。要点のみ:

- **必須**: `id`（kebab-case・全件で一意）, `name`, `operator`, `assetTypes`(1件以上), `stages`(1件以上), `equity`, `application`, `summary`, `url`(http/https)
- **任意**: `nameEn`, `region`, `value`, `eligibility`, `tags`
- `assetTypes`: `free-office` `cloud-credit` `funding` `equity-investment` `grant-subsidy` `mentoring` `talent-program` `community` `overseas` `accelerator`
- `stages`: `idea` `seed` `early` `growth` `any`
- `equity`: `none` `optional` `required`
- `application.status`: `open` `upcoming` `rolling` `recurring` `closed`
  - `open` → `deadline`（ISO `YYYY-MM-DD`）を設定
  - `upcoming` → `opensAt`（ISO `YYYY-MM-DD`）を設定
  - `rolling`/`recurring`/`closed` → 確定日が無ければ `window`（人間可読の周期）や `note` で補う
- **募集時期・金額・条件は変動が激しい。** 確定日（`deadline`/`opensAt`）は裏取りできたものだけ設定し、不確実なものは `window`/`note` に概況で書く。

## Codex CLI からの実行方法

このリポジトリで Codex にアセット追加を依頼する例。

```bash
# 対話モードで起動（リポジトリ直下で実行）
codex

# 非対話で一括実行（タスクを直接渡す）
codex exec "lib/data.ts に『〇〇アクセラレーター』を追加し、bun run validate が通ることを確認して"
```

Codex / Claude Code はこの `AGENTS.md` を自動で読み込むため、上記の手順（`lib/data.ts` 追記 → `bun run validate` → `bun run db:setup`）に沿って作業する。`db:setup`（本番DBへの書き込み）は明示的に依頼されたときだけ実行すること。

## その他のコマンド

```bash
bun run dev        # 開発サーバー
bun run typecheck  # 型チェック (tsc --noEmit)
bun run test       # テスト (vitest)
bun run lint       # Lint
```
