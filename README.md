# Founder Assets JP — 起業家アセット図鑑

日本のスタートアップ・起業家が使える**支援アセット**を 1 か所に集約した横断データベースです。
無料オフィス・クラウドクレジット・アクセラレーター・補助金・人材育成・海外展開までを、次の **4 軸**で検索・絞り込みできます。

- **提供アセット種別** — 無料オフィス / クラウド・SaaSクレジット / 融資 / エクイティ出資 / 補助金・助成金 / メンタリング / 人材発掘・育成 / コミュニティ / 海外展開 / アクセラレーター
- **対象フェーズ** — 創業前・アイデア / シード / アーリー / グロース
- **エクイティ有無** — 非エクイティ / 任意 / 出資（株式取得）
- **募集ステータス** — 募集中 / 募集予定 / 通年募集 / 定期募集 / 募集終了

掲載例: FLAP, FoundX, 未踏 / 未踏アドバンスト, AWS Activate, Microsoft for Startups, Google for Startups, NVIDIA Inception, ASAC, Onlab, Plug and Play Japan, J-StarX, JETRO GSAP, NEDO, 日本公庫 ほか。

## 技術スタック

- [Next.js 15](https://nextjs.org/)（App Router・静的生成）
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vercel](https://vercel.com/) でホスティング
- [Neon Postgres](https://vercel.com/marketplace/neon)（Vercel Marketplace）で DB
- email/password 登録 + Google OAuth + HttpOnly session cookie

DB 未接続のローカル環境では `lib/data.ts` の静的データにフォールバックします。Vercel では Neon の無料枠から始め、`DATABASE_URL` を設定して `db:setup` を実行すると DB の asset を表示します。

## 開発

```bash
bun install      # 依存関係のインストール（npm / pnpm でも可）
bun run dev      # http://localhost:3000
bun run test
bun run build    # 本番ビルド
bun run typecheck
```

## Vercel + Neon セットアップ

1. Vercel Marketplace から Neon Postgres を project に追加します。
2. Vercel が発行する `DATABASE_URL` を local `.env.local` にも設定します。
3. Google Cloud Console の OAuth client に callback URL を追加します。
4. schema 作成と asset 登録を実行します。

必要な環境変数:

```bash
DATABASE_URL="postgres://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

Google OAuth の callback URL:

- local: `http://localhost:3000/api/auth/google/callback`
- Vercel: `https://<your-domain>/api/auth/google/callback`

```bash
DATABASE_URL="postgres://..." bun run db:setup
```

作成される主なテーブル:

- `assets`: アセット本体。`lib/data.ts` から upsert されます。
- `users`: 登録ユーザー。
- `user_sessions`: HttpOnly cookie の session token hash。
- `user_asset_states`: ユーザーごとの「気になる / 申請予定 / 申請済み / 採択 / 不採択 / 見送り」状態。

## データの追加・修正

掲載データの seed 元は [`lib/data.ts`](lib/data.ts) です。1 エントリ = 1 つのプログラム/アセットで、型は [`lib/types.ts`](lib/types.ts) を参照してください。DB 反映は `bun run db:setup` で行います。

**Pull Request を歓迎します。** 新しいプログラムの追加、金額・募集時期・条件の更新、リンク切れの修正など、お気軽にどうぞ。

> ⚠️ 掲載情報は公開情報を基にしたキュレーションです。金額・募集時期・応募条件は変動するため、最終的な内容は必ず各プログラムの**公式サイト**でご確認ください。

## ライセンス

[MIT License](LICENSE) — Built by [Hexis](https://hexis.ltd).
