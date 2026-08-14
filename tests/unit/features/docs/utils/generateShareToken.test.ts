import { generateShareToken } from "@/features/docs/utils/generateShareToken";

describe("generateShareToken", () => {
  describe("Return value", () => {
    it("returns a string", () => {
      const token = generateShareToken();

      expect(typeof token).toBe("string");
    });

    it("returns a 64-character token", () => {
      const token = generateShareToken();

      expect(token).toHaveLength(64);
    });

    it("returns a valid SHA-256 hexadecimal token", () => {
      const token = generateShareToken();

      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it("does not return an empty token", () => {
      const token = generateShareToken();

      expect(token).not.toBe("");
    });
  });

  describe("Token uniqueness", () => {
    it("generates different tokens on successive calls", () => {
      const firstToken = generateShareToken();
      const secondToken = generateShareToken();

      expect(firstToken).not.toBe(secondToken);
    });

    it("generates unique tokens across multiple calls", () => {
      const tokens = Array.from(
        { length: 100 },
        () => generateShareToken(),
      );

      const uniqueTokens = new Set(tokens);

      expect(uniqueTokens.size).toBe(100);
    });
  });

  describe("Token format", () => {
    it("contains only lowercase hexadecimal characters", () => {
      const token = generateShareToken();

      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it("does not contain spaces", () => {
      const token = generateShareToken();

      expect(token).not.toContain(" ");
    });

    it("does not contain hyphens", () => {
      const token = generateShareToken();

      expect(token).not.toContain("-");
    });

    it("does not expose the UUID or timestamp directly", () => {
      const token = generateShareToken();

      expect(token).not.toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
      );
    });
  });
});