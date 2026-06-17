import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteName = "Founder Assets JP — 起業家アセット図鑑";
const description =
  "日本のスタートアップ・起業家が使える支援アセットを、提供アセット種別 / 対象フェーズ / エクイティ有無 / 募集ステータスで横断検索し、ユーザーごとに申請状態を管理できるデータベース。";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: "%s | Founder Assets JP",
  },
  description,
  keywords: [
    "スタートアップ支援",
    "起業家",
    "無料オフィス",
    "アクセラレーター",
    "クラウドクレジット",
    "補助金",
    "FoundX",
    "未踏",
    "FLAP",
  ],
  authors: [{ name: "Hexis" }],
  openGraph: {
    title: siteName,
    description,
    type: "website",
    locale: "ja_JP",
    siteName,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
