import { validateAssets } from "../lib/asset-schema";
import { assets } from "../lib/data";

// lib/data.ts のアセットを検証する。エラーがあれば exit 1。
// 使い方: bun run validate
const issues = validateAssets(assets);
const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");

for (const w of warns) console.warn(`⚠️  [${w.assetId}] ${w.message}`);
for (const e of errors) console.error(`❌ [${e.assetId}] ${e.message}`);

if (errors.length > 0) {
  console.error(
    `\n検証失敗: エラー ${errors.length} 件 / warn ${warns.length} 件`,
  );
  process.exit(1);
}

console.log(`✅ 検証OK: ${assets.length} 件（warn ${warns.length} 件）`);
