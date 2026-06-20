import { describe, expect, it } from "vitest";
import type { Asset } from "./types";
import { getDataCoverage } from "./data-coverage";

const baseAsset: Asset = {
  id: "base",
  name: "Base",
  operator: "Operator",
  region: "全国",
  assetTypes: ["community"],
  stages: ["seed"],
  equity: "none",
  application: { status: "rolling", note: "通年" },
  summary: "起業家コミュニティ",
  url: "https://example.com",
};

function makeAsset(overrides: Partial<Asset>): Asset {
  return { ...baseAsset, ...overrides };
}

describe("data coverage", () => {
  it("counts multi-value fields and normalized regions", () => {
    const coverage = getDataCoverage([
      makeAsset({
        id: "tokyo-grant",
        region: "東京（渋谷）",
        assetTypes: ["grant-subsidy", "mentoring"],
        stages: ["idea", "seed"],
        application: { status: "upcoming", opensAt: "2026-09-01" },
      }),
      makeAsset({
        id: "global-cloud",
        region: "全国 → 海外",
        assetTypes: ["cloud-credit", "overseas"],
        stages: ["early"],
        application: { status: "rolling", note: "通年" },
      }),
    ]);

    expect(coverage.total).toBe(2);
    expect(coverage.assetTypes.find((item) => item.value === "grant-subsidy"))
      .toMatchObject({ count: 1, label: "補助金・助成金" });
    expect(coverage.stages.find((item) => item.value === "seed")).toMatchObject(
      { count: 1, label: "シード" },
    );
    expect(coverage.statuses.find((item) => item.value === "upcoming"))
      .toMatchObject({ count: 1, label: "募集予定" });
    expect(coverage.regions.map((item) => item.value)).toEqual([
      "全国",
      "東京",
      "海外",
    ]);
  });
});
