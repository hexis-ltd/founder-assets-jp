import { describe, expect, it } from "vitest";
import type { Asset } from "./types";
import { deriveAssetScreening, withAssetScreening } from "./asset-screening";

const grantAsset: Asset = {
  id: "tokyo-grant",
  name: "東京都 創業助成事業",
  operator: "東京都中小企業振興公社",
  region: "東京",
  assetTypes: ["grant-subsidy"],
  stages: ["idea", "seed"],
  equity: "none",
  application: {
    status: "upcoming",
    opensAt: "2026-09-29",
    deadline: "2026-10-08",
    note: "電子申請（Jグランツ）のみ",
  },
  value: "上限400万円・助成率2/3",
  eligibility: "都内で創業予定の個人または創業5年未満の法人",
  summary: "人件費、賃借料、広告費等を助成する制度。",
  url: "https://example.com/grant",
  tags: ["東京都", "助成金"],
};

describe("asset screening", () => {
  it("derives screening data founders need for first-pass decisions", () => {
    const screening = deriveAssetScreening(grantAsset);

    expect(screening.fit.summary).toContain("創業予定");
    expect(screening.fit.locationRequirements).toContain("東京");
    expect(screening.benefit.amount).toMatchObject({
      maxAmountJpy: 4_000_000,
      subsidyRate: "2/3",
    });
    expect(screening.effort).toMatchObject({
      level: "high",
      reimbursementOnly: true,
    });
    expect(screening.effort.requiredDocuments).toEqual(
      expect.arrayContaining(["事業計画書", "経費見積・資金計画"]),
    );
    expect(screening.risk.notes.join(" ")).toContain("後払い");
    expect(screening.sources).toEqual([
      {
        checkedAt: "2026-06-21",
        label: "公式サイト",
        url: "https://example.com/grant",
      },
    ]);
  });

  it("returns a new asset with screening without mutating the original", () => {
    const enriched = withAssetScreening(grantAsset);

    expect(enriched).not.toBe(grantAsset);
    expect(grantAsset.screening).toBeUndefined();
    expect(enriched.screening?.effort.level).toBe("high");
  });
});
