import { describe, expect, it } from "vitest";
import { createGoogleAuthorizationUrl, googleUserProfileSchema } from "./google";

describe("Google OAuth helpers", () => {
  it("builds the authorization URL with the local callback", () => {
    const url = createGoogleAuthorizationUrl({
      clientId: "google-client-id",
      origin: "http://localhost:3000",
      state: "state-token",
    });

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("client_id")).toBe("google-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/auth/google/callback",
    );
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("state")).toBe("state-token");
  });

  it("parses the Google user profile shape", () => {
    const parsed = googleUserProfileSchema.safeParse({
      email: "founder@example.com",
      email_verified: true,
      sub: "google-subject",
    });

    expect(parsed.success).toBe(true);
  });
});
