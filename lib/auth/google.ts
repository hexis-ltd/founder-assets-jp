import * as z from "zod";

export const GOOGLE_OAUTH_STATE_COOKIE = "founder_assets_google_oauth_state";
export const GOOGLE_OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

const googleTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().optional(),
  id_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

export const googleUserProfileSchema = z.object({
  email: z.string().email(),
  email_verified: z.boolean(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  sub: z.string().min(1),
});

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
};

export type GoogleUserProfile = z.infer<typeof googleUserProfileSchema>;

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function createGoogleAuthorizationUrl({
  clientId,
  origin,
  state,
}: {
  clientId: string;
  origin: string;
  state: string;
}): URL {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getGoogleRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  return url;
}

export async function exchangeGoogleCode({
  code,
  config,
  origin,
}: {
  code: string;
  config: GoogleOAuthConfig;
  origin: string;
}): Promise<string> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: getGoogleRedirectUri(origin),
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Google token exchange failed");
  }

  const parsed = googleTokenResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Invalid Google token response");
  }
  return parsed.data.access_token;
}

export async function fetchGoogleUserProfile(
  accessToken: string,
): Promise<GoogleUserProfile> {
  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!response.ok) {
    throw new Error("Google userinfo request failed");
  }

  const parsed = googleUserProfileSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Invalid Google user profile");
  }
  return parsed.data;
}

function getGoogleRedirectUri(origin: string): string {
  return new URL("/api/auth/google/callback", origin).toString();
}
