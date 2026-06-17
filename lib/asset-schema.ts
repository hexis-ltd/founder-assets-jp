import { z } from "zod";
import {
  APPLICATION_STATUS_VALUES,
  ASSET_TYPE_VALUES,
  EQUITY_VALUES,
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
  url: z
    .string()
    .url()
    .refine(
      (u) => u.startsWith("http://") || u.startsWith("https://"),
      "http(s) のURLを指定してください",
    ),
  tags: z.array(z.string().min(1)).optional(),
});

export interface ValidationIssue {
  level: "error" | "warn";
  assetId: string;
  message: string;
}

// assets 配列全体を検証し、問題を列挙して返す（例外は投げない）。
// error: DB反映を止めるべき不正。warn: 反映は可だが要確認。
export function validateAssets(assets: unknown[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Map<string, number>();

  assets.forEach((raw, i) => {
    const label =
      raw && typeof raw === "object" && typeof (raw as { id?: unknown }).id === "string"
        ? (raw as { id: string }).id
        : `#${i}`;

    const parsed = assetSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".") || "(root)";
        issues.push({ level: "error", assetId: label, message: `${path}: ${issue.message}` });
      }
      return;
    }

    const asset = parsed.data;

    // ID重複
    const prev = seen.get(asset.id);
    if (prev !== undefined) {
      issues.push({
        level: "error",
        assetId: asset.id,
        message: `id が重複しています（最初の出現: index ${prev}）`,
      });
    } else {
      seen.set(asset.id, i);
    }

    // status と日付の整合（warn）
    if (asset.application.status === "open" && !asset.application.deadline) {
      issues.push({
        level: "warn",
        assetId: asset.id,
        message: 'status="open" ですが deadline が未設定です',
      });
    }
    if (asset.application.status === "upcoming" && !asset.application.opensAt) {
      issues.push({
        level: "warn",
        assetId: asset.id,
        message: 'status="upcoming" ですが opensAt が未設定です',
      });
    }
  });

  return issues;
}
