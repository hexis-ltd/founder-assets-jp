import { describe, expect, it } from "vitest";
import type { Asset } from "./types";
import { assetCsvHeaders, assetsToCsv, assetsToJsonDataset } from "./asset-export";

const asset: Asset = {
  id: "tokyo-grant",
  name: "東京都 創業助成事業",
  operator: "東京都中小企業振興公社",
  region: "東京",
  assetTypes: ["grant-subsidy", "mentoring"],
  stages: ["idea", "seed"],
  equity: "none",
  application: {
    status: "upcoming",
    opensAt: "2026-09-29",
    deadline: "2026-10-08",
    window: "年2回",
    note: "申請要件あり",
  },
  value: "上限400万円",
  eligibility: "都内で創業予定の個人",
  summary: "人件費、賃借料、広告費等を助成する制度。",
  url: "https://example.com/grant",
  tags: ["東京都", "助成金"],
};

describe("asset export", () => {
  it("serializes assets to a JSON dataset with metadata", () => {
    const dataset = assetsToJsonDataset([asset], "2026年6月");

    expect(dataset).toMatchObject({
      coverage: expect.objectContaining({
        total: 1,
      }),
      count: 1,
      generatedAt: expect.any(String),
      homepage: "https://github.com/hexis-ltd/founder-assets-jp",
      lastChecked: "2026年6月",
      license: "MIT",
      quality: {
        hasApplicationStatus: 1,
        hasOfficialUrl: 1,
        hasRegion: 1,
        hasScreening: 1,
        hasScreeningSources: 1,
        hasStructuredAmount: 1,
        hasTags: 1,
      },
      schema: expect.objectContaining({
        fields: expect.arrayContaining([
          "id",
          "name",
          "assetTypes",
          "screening",
          "url",
        ]),
        notes: expect.any(Array),
      }),
      schemaVersion: 2,
    });
    expect(dataset.assets[0]).toMatchObject({
      ...asset,
      screening: expect.objectContaining({
        effort: expect.objectContaining({ level: "high" }),
      }),
    });
  });

  it("serializes assets to CSV with stable, spreadsheet-friendly columns", () => {
    const csv = assetsToCsv([asset]);
    const [header, row] = csv.split("\n");

    expect(header).toBe(assetCsvHeaders.join(","));
    expect(row).toContain("tokyo-grant");
    expect(row).toContain("grant-subsidy;mentoring");
    expect(row).toContain("upcoming");
    expect(row).toContain("2026-10-08");
    expect(row).toContain("high");
    expect(row).toContain("事業計画書");
  });

  it("escapes CSV fields that contain commas, quotes, or new lines", () => {
    const csv = assetsToCsv([
      {
        ...asset,
        name: 'Alpha, "Beta"\nProgram',
      },
    ]);

    expect(csv).toContain('"Alpha, ""Beta""\nProgram"');
  });
});
