import { NextResponse } from "next/server";
import { authPayloadSchema } from "@/lib/auth/schemas";
import { createSession } from "@/lib/auth/session";
import { verifyUserPassword } from "@/lib/auth/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = authPayloadSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力内容を確認してください" },
      { status: 400 },
    );
  }

  try {
    const user = await verifyUserPassword(parsed.data);
    if (!user) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが違います" },
        { status: 401 },
      );
    }
    await createSession(user.id);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 },
    );
  }
}
