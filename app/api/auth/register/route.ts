import { NextResponse } from "next/server";
import { authPayloadSchema } from "@/lib/auth/schemas";
import { createSession } from "@/lib/auth/session";
import { createUserWithPassword, isUniqueViolation } from "@/lib/auth/users";

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
    const user = await createUserWithPassword(parsed.data);
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "このメールアドレスは登録済みです" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "ユーザー登録に失敗しました" },
      { status: 500 },
    );
  }
}
