import { assets as staticAssets } from "@/lib/data";
import { getSql, requireSql } from "@/lib/db/client";
import { withAssetScreening } from "@/lib/asset-screening";
import {
  type Application,
  type Asset,
  type AssetScreening,
  type AssetType,
  type Equity,
  type Stage,
  type UserAssetState,
  type UserAssetStatus,
} from "@/lib/types";

type AssetRow = {
  id: string;
  name: string;
  name_en: string | null;
  operator: string;
  region: string | null;
  asset_types: unknown;
  stages: unknown;
  equity: Equity;
  application: unknown;
  value: string | null;
  eligibility: string | null;
  summary: string;
  url: string;
  screening: unknown;
  tags: unknown;
};

type StateRow = {
  asset_id: string;
  status: UserAssetStatus;
  updated_at: Date | string;
};

export async function getAssets(): Promise<Asset[]> {
  const sql = getSql();
  if (!sql) return staticAssets;
  const rows = (await sql`
    select id, name, name_en, operator, region, asset_types, stages, equity,
      application, value, eligibility, summary, url, screening, tags
    from assets
    order by name
  `) as AssetRow[];
  return rows.map(rowToAsset);
}

export async function getUserAssetStates(
  userId: string,
): Promise<UserAssetState[]> {
  const sql = requireSql();
  const rows = (await sql`
    select asset_id, status, updated_at
    from user_asset_states
    where user_id = ${userId}
  `) as StateRow[];
  return rows.map(rowToState);
}

export async function setUserAssetState({
  assetId,
  status,
  userId,
}: {
  assetId: string;
  status: UserAssetStatus;
  userId: string;
}): Promise<UserAssetState> {
  if (status === "not_started") {
    await deleteUserAssetState(userId, assetId);
    return { assetId, status, updatedAt: new Date().toISOString() };
  }
  const sql = requireSql();
  const rows = (await sql`
    insert into user_asset_states (user_id, asset_id, status)
    values (${userId}, ${assetId}, ${status})
    on conflict (user_id, asset_id)
    do update set status = excluded.status, updated_at = now()
    returning asset_id, status, updated_at
  `) as StateRow[];
  return rowToState(rows[0]);
}

async function deleteUserAssetState(
  userId: string,
  assetId: string,
): Promise<void> {
  const sql = requireSql();
  await sql`
    delete from user_asset_states
    where user_id = ${userId} and asset_id = ${assetId}
  `;
}

function rowToAsset(row: AssetRow): Asset {
  return withAssetScreening({
    id: row.id,
    name: row.name,
    nameEn: row.name_en ?? undefined,
    operator: row.operator,
    region: row.region ?? undefined,
    assetTypes: asArray<AssetType>(row.asset_types),
    stages: asArray<Stage>(row.stages),
    equity: row.equity,
    application: row.application as Application,
    value: row.value ?? undefined,
    eligibility: row.eligibility ?? undefined,
    summary: row.summary,
    url: row.url,
    screening: asScreening(row.screening),
    tags: asArray<string>(row.tags),
  });
}

function rowToState(row: StateRow): UserAssetState {
  const updatedAt =
    row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : new Date(row.updated_at).toISOString();
  return { assetId: row.asset_id, status: row.status, updatedAt };
}

function asArray<T extends string>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
}

function asScreening(value: unknown): AssetScreening | undefined {
  if (!value || typeof value !== "object") return undefined;
  return "lastCheckedAt" in value ? (value as AssetScreening) : undefined;
}
