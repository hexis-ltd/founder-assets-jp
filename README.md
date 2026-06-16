# Founder Assets JP — 起業家アセット図鑑

日本のスタートアップ・起業家が使える**支援アセット**を 1 か所に集約した横断データベースです。
無料オフィス・クラウドクレジット・アクセラレーター・補助金・人材育成・海外展開までを、次の **4 軸**で検索・絞り込みできます。

- **提供アセット種別** — 無料オフィス / クラウド・SaaSクレジット / 融資 / エクイティ出資 / 補助金・助成金 / メンタリング / 人材発掘・育成 / コミュニティ / 海外展開 / アクセラレーター
- **対象フェーズ** — 創業前・アイデア / シード / アーリー / グロース
- **エクイティ有無** — 非エクイティ / 任意 / 出資（株式取得）
- **申込時期** — 通年 / 期別募集 / 年1回前後 / 不定期

掲載例: FLAP, FoundX, 未踏 / 未踏アドバンスト, AWS Activate, Microsoft for Startups, Google for Startups, NVIDIA Inception, ASAC, Onlab, Plug and Play Japan, J-StarX, JETRO GSAP, NEDO, 日本公庫 ほか。

## 技術スタック

- [Next.js 15](https://nextjs.org/)（App Router・静的生成）
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vercel](https://vercel.com/) でホスティング

検索・フィルタはクライアントサイドで完結し、サーバー不要で高速に動作します。

## 開発

```bash
bun install      # 依存関係のインストール（npm / pnpm でも可）
bun run dev      # http://localhost:3000
bun run build    # 本番ビルド
bun run typecheck
```

## データの追加・修正

掲載データは [`lib/data.ts`](lib/data.ts) に集約されています。1 エントリ = 1 つのプログラム/アセットで、型は [`lib/types.ts`](lib/types.ts) を参照してください。

**Pull Request を歓迎します。** 新しいプログラムの追加、金額・募集時期・条件の更新、リンク切れの修正など、お気軽にどうぞ。

> ⚠️ 掲載情報は公開情報を基にしたキュレーションです。金額・募集時期・応募条件は変動するため、最終的な内容は必ず各プログラムの**公式サイト**でご確認ください。

## ライセンス

[MIT License](LICENSE) — Built by [Hexis](https://hexis.ltd).
