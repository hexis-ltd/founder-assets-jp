import { neon } from "@neondatabase/serverless";
import { validateAssets } from "../lib/asset-schema";
import { assets } from "../lib/data";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

validateOrThrow();

const sql = neon(databaseUrl);

await createSchema();
await seedAssets();

// DBへ反映する前にアセットデータを検証する。
// 不正データ（ID重複・enum外・日付形式不正など）の混入を未然に防ぐ。
function validateOrThrow() {
  const issues = validateAssets(assets);
  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");
  for (const w of warns) console.warn(`⚠️  [${w.assetId}] ${w.message}`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`❌ [${e.assetId}] ${e.message}`);
    throw new Error(
      `アセット検証に失敗しました（エラー ${errors.length} 件）。DBへの反映を中止します。`,
    );
  }
  console.log(`✅ 検証OK: ${assets.length} 件（warn ${warns.length} 件）`);
}

async function createSchema() {
  await sql`create extension if not exists pgcrypto`;
  await sql`
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text not null unique,
      password_hash text,
      google_sub text,
      name text,
      picture text,
      created_at timestamptz not null default now()
    )
  `;
  await sql`alter table users alter column password_hash drop not null`;
  await sql`alter table users add column if not exists google_sub text`;
  await sql`alter table users add column if not exists name text`;
  await sql`alter table users add column if not exists picture text`;
  await sql`
    create table if not exists user_sessions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      token_hash text not null unique,
      expires_at timestamptz not null,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists assets (
      id text primary key,
      name text not null,
      name_en text,
      operator text not null,
      region text,
      asset_types jsonb not null,
      stages jsonb not null,
      equity text not null,
      application jsonb not null,
      value text,
      eligibility text,
      summary text not null,
      url text not null,
      tags jsonb not null default '[]'::jsonb,
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists user_asset_states (
      user_id uuid not null references users(id) on delete cascade,
      asset_id text not null references assets(id) on delete cascade,
      status text not null check (
        status in ('interested', 'planned', 'applied', 'accepted', 'rejected', 'skipped')
      ),
      updated_at timestamptz not null default now(),
      primary key (user_id, asset_id)
    )
  `;
  await sql`
    create index if not exists user_sessions_expires_at_idx
    on user_sessions (expires_at)
  `;
  await sql`
    create unique index if not exists users_google_sub_key
    on users (google_sub)
    where google_sub is not null
  `;
  await sql`
    create index if not exists user_asset_states_user_id_idx
    on user_asset_states (user_id)
  `;
}

async function seedAssets() {
  for (const asset of assets) {
    await sql`
      insert into assets (
        id, name, name_en, operator, region, asset_types, stages, equity,
        application, value, eligibility, summary, url, tags, updated_at
      )
      values (
        ${asset.id},
        ${asset.name},
        ${asset.nameEn ?? null},
        ${asset.operator},
        ${asset.region ?? null},
        ${JSON.stringify(asset.assetTypes)}::jsonb,
        ${JSON.stringify(asset.stages)}::jsonb,
        ${asset.equity},
        ${JSON.stringify(asset.application)}::jsonb,
        ${asset.value ?? null},
        ${asset.eligibility ?? null},
        ${asset.summary},
        ${asset.url},
        ${JSON.stringify(asset.tags ?? [])}::jsonb,
        now()
      )
      on conflict (id) do update set
        name = excluded.name,
        name_en = excluded.name_en,
        operator = excluded.operator,
        region = excluded.region,
        asset_types = excluded.asset_types,
        stages = excluded.stages,
        equity = excluded.equity,
        application = excluded.application,
        value = excluded.value,
        eligibility = excluded.eligibility,
        summary = excluded.summary,
        url = excluded.url,
        tags = excluded.tags,
        updated_at = now()
    `;
  }
}
