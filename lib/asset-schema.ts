import { z } from "zod";
import {
  APPLICATION_STATUS_VALUES,
  ASSET_TYPE_VALUES,
  EQUITY_VALUES,
  SCREENING_EFFORT_VALUES,
  SCREENING_RISK_VALUES,
  STAGE_VALUES,
} from "./types";

// ============================================================
// アセットの実行時バリデーション。
// tsc が「型」を守るのに対し、ここでは型では表現しきれない
// 「値の妥当性（ID重複・日付形式・URL・整合性）」を検証する。
// CC/Codex 等が lib/data.ts に追記したデータの取りこぼしを防ぐ。
// ============================================================

// ISO日付（YYYY-MM-DD）。形式と実在性の両方を確認する。
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で指定してください")
  .refine((s) => !Number.isNaN(Date.parse(s)), "存在しない日付です");

export const applicationSchema = z.object({
  status: z.enum(APPLICATION_STATUS_VALUES),
  deadline: isoDate.optional(),
  opensAt: isoDate.optional(),
  window: z.string().min(1).optional(),
  note: z.string().min(1).optional(),
});

const httpUrl = z
  .string()
  .url()
  .refine(
    (u) => u.startsWith("http://") || u.startsWith("https://"),
    "http(s) のURLを指定してください",
  );

const screeningSourceSchema = z.object({
  checkedAt: isoDate,
  label: z.string().min(1).optional(),
  note: z.string().min(1).optional(),
  url: httpUrl,
});

const screeningAmountSchema = z.object({
  label: z.string().min(1),
  maxAmountJpy: z.number().int().positive().optional(),
  original: z.string().min(1).optional(),
  repayable: z.boolean().optional(),
  subsidyRate: z.string().min(1).optional(),
});

export const assetScreeningSchema = z.object({
  lastCheckedAt: isoDate,
  sources: z.array(screeningSourceSchema).min(1),
  fit: z.object({
    summary: z.string().min(1),
    stages: z.array(z.enum(STAGE_VALUES)).min(1),
    region: z.string().min(1).optional(),
    founderTypes: z.array(z.string().min(1)),
    sectors: z.array(z.string().min(1)),
    companyAge: z.string().min(1).optional(),
    locationRequirements: z.array(z.string().min(1)),
  }),
  benefit: z.object({
    summary: z.string().min(1),
    amount: screeningAmountSchema.optional(),
    nonCash: z.array(z.string().min(1)),
  }),
  effort: z.object({
    level: z.enum(SCREENING_EFFORT_VALUES),
    requiredDocuments: z.array(z.string().min(1)),
    selectionSteps: z.array(z.string().min(1)),
    timeCommitment: z.string().min(1),
    costNote: z.string().min(1).optional(),
    reimbursementOnly: z.boolean().optional(),
  }),
  risk: z.object({
    level: z.enum(SCREENING_RISK_VALUES),
    notes: z.array(z.string().min(1)),
  }),
});

export const assetSchema = z.object({
  id: z
    .string()
    .regex(
      /^[a-z0-9][a-z0-9-]*$/,
      "id は英小文字・数字・ハイフン（kebab-case）で指定してください",
    ),
  name: z.string().min(1),
  nameEn: z.string().min(1).optional(),
  operator: z.string().min(1),
  region: z.string().min(1).optional(),
  assetTypes: z.array(z.enum(ASSET_TYPE_VALUES)).min(1),
  stages: z.array(z.enum(STAGE_VALUES)).min(1),
  equity: z.enum(EQUITY_VALUES),
  application: applicationSchema,
  value: z.string().min(1).optional(),
  eligibility: z.string().min(1).optional(),
  summary: z.string().min(1),
  url: httpUrl,
  screening: assetScreeningSchema.optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export interface ValidationIssue {
  level: "error" | "warn";
  assetId: string;
  message: string;
}

type ParsedAsset = z.infer<typeof assetSchema>;

// assets 配列全体を検証し、問題を列挙して返す（例外は投げない）。
// error: DB反映を止めるべき不正。warn: 反映は可だが要確認。
export function validateAssets(assets: unknown[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, number>();

  assets.forEach((raw, i) => {
    const label = getAssetLabel(raw, i);
    const parsed = assetSchema.safeParse(raw);
    if (!parsed.success) {
      issues.push(...formatParseIssues(label, parsed.error.issues));
      return;
    }

    const asset = parsed.data;
    issues.push(...validateUniqueId(asset, i, seen));
    issues.push(...validateApplicationTiming(asset));
  });

  return issues;
}

function getAssetLabel(raw: unknown, index: number): string {
  return raw &&
    typeof raw === "object" &&
    typeof (raw as { id?: unknown }).id === "string"
    ? (raw as { id: string }).id
    : `#${index}`;
}

function formatParseIssues(
  assetId: string,
  issues: z.core.$ZodIssue[],
): ValidationIssue[] {
  return issues.map((issue) => {
    const path = issue.path.join(".") || "(root)";
    return { level: "error", assetId, message: `${path}: ${issue.message}` };
  });
}

function validateUniqueId(
  asset: ParsedAsset,
  index: number,
  seen: Map<string, number>,
): ValidationIssue[] {
  const prev = seen.get(asset.id);
  if (prev === undefined) {
    seen.set(asset.id, index);
    return [];
  }
  return [{
    level: "error",
    assetId: asset.id,
    message: `id が重複しています（最初の出現: index ${prev}）`,
  }];
}

function validateApplicationTiming(asset: ParsedAsset): ValidationIssue[] {
  return [
    asset.application.status === "open" && !asset.application.deadline
      ? warn(asset.id, 'status="open" ですが deadline が未設定です')
      : undefined,
    asset.application.status === "upcoming" && !asset.application.opensAt
      ? warn(asset.id, 'status="upcoming" ですが opensAt が未設定です')
      : undefined,
  ].filter((issue): issue is ValidationIssue => Boolean(issue));
}

function warn(assetId: string, message: string): ValidationIssue {
  return { level: "warn", assetId, message };
}
