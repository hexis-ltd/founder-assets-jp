import { ImageResponse } from "next/og";
import { assets } from "@/lib/data";

export const runtime = "edge";
export const alt = "Founder Assets JP — 起業家アセット図鑑";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0b0d12 0%, #141b2e 100%)",
          color: "#e7ecf3",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#5b8cff",
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#5b8cff",
            }}
          />
          Founder Assets JP
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 76,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          起業家アセット図鑑
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            color: "#9aa6b8",
            maxWidth: 920,
            lineHeight: 1.4,
          }}
        >
          日本のスタートアップが使える支援アセットを4軸で横断検索。現在
          {assets.length}件を掲載。
        </div>
      </div>
    ),
    { ...size },
  );
}
