import { describe, expect, it } from "vitest";
import { assetSchema, validateAssets } from "./asset-schema";

const validAsset = {
  id: "screened-asset",
  name: "Screened Asset",
  operator: "Operator",
  region: "全国",
  assetTypes: ["community"],
  stages: ["seed"],
  equity: "none",
  application: { status: "rolling", note: "通年" },
  summary: "起業家コミュニティ",
  url: "https://example.com",
  tags: ["コミュニティ"],
  screening: {
    lastCheckedAt: "2026-06-21",
    sources: [
      {
        checkedAt: "2026-06-21",
        label: "公式サイト",
        url: "https://example.com",
      },
    ],
    fit: {
      summary: "対象者",
      stages: ["seed"],
      region: "全国",
      founderTypes: [],
      sectors: [],
      locationRequirements: [],
    },
    benefit: {
      summary: "支援内容",
      nonCash: ["コミュニティ・ネットワーク"],
    },
    effort: {
      level: "medium",
      requiredDocuments: ["申請フォーム"],
      selectionSteps: ["応募フォーム提出"],
      timeCommitment: "数時間〜数日",
    },
    risk: {
      level: "low",
      notes: ["募集条件は公式サイトで最終確認"],
    },
  },
};

describe("asset schema screening fields", () => {
  it("accepts structured screening information", () => {
    expect(assetSchema.safeParse(validAsset).success).toBe(true);
  });

  it("reports invalid screening source dates and URLs", () => {
    const issues = validateAssets([
      {
        ...validAsset,
        screening: {
          ...validAsset.screening,
          sources: [{ checkedAt: "2026/06/21", url: "ftp://example.com" }],
        },
      },
    ]);

    expect(issues.map((issue) => issue.message).join(" ")).toContain(
      "screening.sources.0.checkedAt",
    );
    expect(issues.map((issue) => issue.message).join(" ")).toContain(
      "screening.sources.0.url",
    );
  });
});
