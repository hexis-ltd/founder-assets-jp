import { describe, expect, it } from "vitest";
import type { Asset, AssetType, Equity, Stage, UserAssetState } from "./types";
import {
  applyQuickFilter,
  createEmptyFilters,
  type FilterState,
  filtersFromSearchParams,
  filtersToSearchParams,
  getActiveCount,
  getApplicationActionSummary,
  getFilteredAssets,
  getPlaybookSummaries,
  getRegionOptions,
  getVisibleAssets,
  PLAYBOOKS,
  QUICK_FILTERS,
} from "./directory-utils";

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

describe("directory filters", () => {
  it("extracts practical region facets from mixed region labels", () => {
    const assets = [
      makeAsset({ id: "tokyo", region: "東京（丸の内）" }),
      makeAsset({ id: "global", region: "全国 → 海外" }),
      makeAsset({ id: "us", region: "米国/グローバル" }),
    ];

    expect(getRegionOptions(assets).map((option) => option.value)).toEqual([
      "全国",
      "東京",
      "海外",
      "グローバル",
      "米国",
    ]);
  });

  it("filters by quick presets without mutating the base filters", () => {
    const base = createEmptyFilters();
    const preset = QUICK_FILTERS.find((filter) => filter.id === "available-now");

    expect(preset).toBeDefined();
    const next = applyQuickFilter(base, preset!);

    expect(base.statuses).toEqual([]);
    expect(next.statuses).toEqual(["open", "rolling"]);
    expect(getActiveCount(next)).toBe(2);
  });

  it("filters assets by region, type, and saved view mode", () => {
    const assets = [
      makeAsset({
        id: "tokyo-cloud",
        region: "東京",
        assetTypes: ["cloud-credit"],
      }),
      makeAsset({
        id: "global-accelerator",
        region: "グローバル",
        assetTypes: ["accelerator", "overseas"],
      }),
    ];
    const filters = {
      ...createEmptyFilters(),
      assetTypes: ["cloud-credit" as const],
      regions: ["東京"],
    };
    const stateByAssetId: Record<string, UserAssetState> = {
      "tokyo-cloud": {
        assetId: "tokyo-cloud",
        status: "interested",
        updatedAt: "2026-06-21T00:00:00.000Z",
      },
    };

    expect(getFilteredAssets(assets, filters).map((asset) => asset.id)).toEqual(
      ["tokyo-cloud"],
    );
    expect(
      getVisibleAssets({
        assets,
        filters,
        stateByAssetId,
        viewMode: "saved",
      }).map((asset) => asset.id),
    ).toEqual(["tokyo-cloud"]);
  });

  it("builds playbook summaries with prioritized featured assets", () => {
    const assets = [
      makeAsset({
        id: "go-tech",
        name: "Go-Tech",
        assetTypes: ["grant-subsidy"],
        summary: "大学連携の研究開発",
        tags: ["研究開発"],
      }),
      makeAsset({
        id: "nedo-dtsu",
        name: "NEDO DTSU",
        assetTypes: ["grant-subsidy"],
        summary: "ディープテック研究開発",
        tags: ["ディープテック"],
      }),
      makeAsset({
        id: "apt-women",
        name: "APT Women",
        summary: "女性起業家の成長支援",
        tags: ["女性起業家"],
      }),
    ];
    const summaries = getPlaybookSummaries(assets);
    const deeptech = summaries.find((summary) => summary.id === "deeptech-rd");
    const women = summaries.find((summary) => summary.id === "women-founders");

    expect(PLAYBOOKS.some((playbook) => playbook.id === "deeptech-rd")).toBe(
      true,
    );
    expect(deeptech?.assetCount).toBe(2);
    expect(deeptech?.featuredAssets.map((asset) => asset.id)).toEqual([
      "nedo-dtsu",
      "go-tech",
    ]);
    expect(women?.assetCount).toBe(1);
    expect(women?.featuredAssets.map((asset) => asset.id)).toEqual([
      "apt-women",
    ]);
  });

  it("round-trips filters through URL search params", () => {
    const filters = {
      ...createEmptyFilters(),
      query: "女性起業家",
      assetTypes: ["overseas", "grant-subsidy"] satisfies AssetType[],
      stages: ["idea"] satisfies Stage[],
      equities: ["none"] satisfies Equity[],
      statuses: ["rolling"] satisfies FilterState["statuses"],
      regions: ["東京", "海外"],
    };
    const params = filtersToSearchParams(filters);

    expect(params.toString()).toContain("q=");
    expect(filtersFromSearchParams(params)).toEqual(filters);
  });

  it("ignores invalid URL filter values", () => {
    const params = new URLSearchParams({
      equity: "none,invalid",
      q: "  cloud  ",
      status: "rolling,bad",
      type: "cloud-credit,nope",
    });

    expect(filtersFromSearchParams(params)).toEqual({
      ...createEmptyFilters(),
      query: "cloud",
      assetTypes: ["cloud-credit"],
      equities: ["none"],
      statuses: ["rolling"],
    });
  });

  it("summarizes current application actions by urgency", () => {
    const assets = [
      makeAsset({
        id: "later",
        name: "Later",
        application: { status: "upcoming", opensAt: "2026-08-01" },
      }),
      makeAsset({
        id: "soon",
        name: "Soon",
        application: { status: "open", deadline: "2026-07-01" },
      }),
      makeAsset({
        id: "rolling",
        name: "Rolling",
        application: { status: "rolling", note: "通年" },
      }),
    ];

    const summary = getApplicationActionSummary(
      assets,
      new Date("2026-06-21T00:00:00.000Z"),
    );

    expect(summary.openCount).toBe(1);
    expect(summary.upcomingCount).toBe(1);
    expect(summary.rollingCount).toBe(1);
    expect(summary.nextAssets.map((item) => item.asset.id)).toEqual([
      "soon",
      "later",
    ]);
    expect(summary.nextAssets[0]?.status.detail).toContain("あと10日");
  });
});
