import { describe, expect, it } from "vitest";
import type { Asset } from "./types";
import {
  getApplicationTiming,
  getAssetDecisionProfile,
} from "./asset-decision";

const baseAsset: Asset = {
  id: "base",
  name: "Base",
  operator: "Operator",
  region: "東京",
  assetTypes: ["grant-subsidy"],
  stages: ["idea", "seed"],
  equity: "none",
  application: {
    status: "open",
    deadline: "2026-07-01",
    note: "事業計画書が必要",
  },
  value: "上限400万円",
  eligibility: "都内で創業予定の個人または創業5年未満の法人",
  summary: "人件費や広告費を助成する制度。",
  url: "https://example.com",
  tags: ["助成金"],
};

describe("asset decision profile", () => {
  it("organizes an asset around fit, effort, and return", () => {
    const profile = getAssetDecisionProfile(
      baseAsset,
      new Date("2026-06-21T00:00:00.000Z"),
    );

    expect(profile.fit.map((item) => item.label)).toEqual([
      "対象",
      "フェーズ",
      "地域",
    ]);
    expect(profile.effortLevel.label).toBe("重い");
    expect(profile.effort.map((item) => item.label)).toContain("申請");
    expect(profile.effort.map((item) => item.label)).toContain("コスト");
    expect(profile.return[0]).toEqual({
      label: "リターン",
      value: "上限400万円",
    });
  });

  it("marks cloud credits as lighter effort and keeps equity cost visible", () => {
    const profile = getAssetDecisionProfile({
      ...baseAsset,
      assetTypes: ["cloud-credit"],
      application: { status: "rolling", note: "オンライン申請" },
      equity: "none",
      value: "最大10万ドル相当のクラウドクレジット",
    });

    expect(profile.effortLevel.label).toBe("軽い");
    expect(profile.effort).toContainEqual({
      label: "コスト",
      value: "株式取得なし",
    });
    expect(profile.return[0]?.value).toContain("クラウドクレジット");
  });

  it("falls back to summary when explicit value is missing", () => {
    const profile = getAssetDecisionProfile({
      ...baseAsset,
      value: undefined,
      summary: "専門家メンタリングと投資家接点を提供。",
    });

    expect(profile.return[0]).toEqual({
      label: "リターン",
      value: "専門家メンタリングと投資家接点を提供。",
    });
  });

  it("makes application timing explicit even when no fixed deadline exists", () => {
    expect(getApplicationTiming(baseAsset)).toEqual({
      label: "締切",
      value: "2026/7/1",
    });
    expect(
      getApplicationTiming({
        ...baseAsset,
        application: {
          status: "upcoming",
          opensAt: "2026-09-29",
          deadline: "2026-10-08",
        },
      }).value,
    ).toBe("開始 2026/9/29 ・ 締切 2026/10/8");
    expect(
      getApplicationTiming({
        ...baseAsset,
        application: { status: "rolling", note: "オンラインで随時受付" },
      }),
    ).toEqual({ label: "締切", value: "随時受付" });
    expect(
      getApplicationTiming({
        ...baseAsset,
        application: { status: "recurring", window: "例年春に公募" },
      }),
    ).toEqual({ label: "締切", value: "例年春に公募" });
  });
});
