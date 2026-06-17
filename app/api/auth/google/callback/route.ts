import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  exchangeGoogleCode,
  fetchGoogleUserProfile,
  getGoogleOAuthConfig,
} from "@/lib/auth/google";
import { createSession } from "@/lib/auth/session";
import { findOrCreateGoogleUser } from "@/lib/auth/users";

export const runtime = "nodejs";

const callbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const result = await handleGoogleCallback(url);
  const response = NextResponse.redirect(new URL(result.redirectTo, origin));
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

async function handleGoogleCallback(
  url: URL,
): Promise<{ redirectTo: "/" | `/signin?error=${string}` }> {
  const config = getGoogleOAuthConfig();
  if (!config) return { redirectTo: "/signin?error=google_unconfigured" };

  const parsed = callbackQuerySchema.safeParse({
    code: url.searchParams.get("code"),
    state: url.searchParams.get("state"),
  });
  if (!parsed.success) return { redirectTo: "/signin?error=oauth_invalid" };

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  if (!expectedState || expectedState !== parsed.data.state) {
    return { redirectTo: "/signin?error=oauth_state" };
  }

  try {
    const accessToken = await exchangeGoogleCode({
      code: parsed.data.code,
      config,
      origin: url.origin,
    });
    const profile = await fetchGoogleUserProfile(accessToken);
    if (!profile.email_verified) {
      return { redirectTo: "/signin?error=google_email_unverified" };
    }
    const user = await findOrCreateGoogleUser({
      email: profile.email,
      googleSub: profile.sub,
      name: profile.name,
      picture: profile.picture,
    });
    await createSession(user.id);
    return { redirectTo: "/" };
  } catch {
    return { redirectTo: "/signin?error=oauth_failed" };
  }
}
