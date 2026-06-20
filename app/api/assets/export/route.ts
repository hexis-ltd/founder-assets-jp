import { NextResponse } from "next/server";
import { z } from "zod";
import { assetsToCsv, assetsToJsonDataset } from "@/lib/asset-export";
import { LAST_CHECKED } from "@/lib/data";
import { getAssets } from "@/lib/db/assets";

export const runtime = "nodejs";

const exportQuerySchema = z.object({
  format: z.enum(["json", "csv"]).default("json"),
});

export async function GET(request: Request) {
  const parsed = exportQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "format は json または csv を指定してください" },
      { status: 400 },
    );
  }

  const assets = await getAssets();
  if (parsed.data.format === "csv") {
    return new Response(assetsToCsv(assets), {
      headers: {
        "Content-Disposition": 'attachment; filename="founder-assets-jp.csv"',
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  }

  return NextResponse.json(assetsToJsonDataset(assets, LAST_CHECKED), {
    headers: {
      "Content-Disposition": 'attachment; filename="founder-assets-jp.json"',
    },
  });
}
