import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
  createGoogleAuthorizationUrl,
  getGoogleOAuthConfig,
} from "@/lib/auth/google";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const config = getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(
      new URL("/signin?error=google_unconfigured", origin),
    );
  }

  const state = randomBytes(32).toString("base64url");
  const response = NextResponse.redirect(
    createGoogleAuthorizationUrl({
      clientId: config.clientId,
      origin,
      state,
    }),
  );
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    maxAge: GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
