import { NextResponse } from "next/server";
import { assetStatePayloadSchema } from "@/lib/auth/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserAssetStates, setUserAssetState } from "@/lib/db/assets";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ states: [] }, { status: 401 });
  const states = await getUserAssetStates(user.id);
  return NextResponse.json({ states });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });

  const parsed = assetStatePayloadSchema.safeParse(
    await request.json().catch(null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力内容を確認してください" },
      { status: 400 },
    );
  }

  try {
    const state = await setUserAssetState({ userId: user.id, ...parsed.data });
    return NextResponse.json({ state });
  } catch {
    return NextResponse.json(
      { error: "アセット状態の保存に失敗しました" },
      { status: 500 },
    );
  }
}
