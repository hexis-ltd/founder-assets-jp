import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies the original password", async () => {
    const encoded = await hashPassword("correct horse battery staple");

    await expect(
      verifyPassword("correct horse battery staple", encoded),
    ).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    const encoded = await hashPassword("correct horse battery staple");

    await expect(verifyPassword("wrong password", encoded)).resolves.toBe(
      false,
    );
  });
});
