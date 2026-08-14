import { titleSchema } from "@/features/docs/validations/documents";

describe("titleSchema", () => {
  describe("Valid titles", () => {
    it("accepts a valid title", () => {
      const result = titleSchema.safeParse("Project Planning");

      expect(result.success).toBe(true);
    });

    it("accepts a title with exactly 2 characters", () => {
      const result = titleSchema.safeParse("AB");

      expect(result.success).toBe(true);
    });

    it("accepts a title with exactly 50 characters", () => {
      const title = "A".repeat(50);

      const result = titleSchema.safeParse(title);

      expect(result.success).toBe(true);
    });

    it("accepts titles containing spaces", () => {
      const result = titleSchema.safeParse(
        "Project Launch Plan",
      );

      expect(result.success).toBe(true);
    });

    it("accepts titles containing numbers", () => {
      const result = titleSchema.safeParse(
        "Project 2026",
      );

      expect(result.success).toBe(true);
    });

    it("accepts titles containing special characters", () => {
      const result = titleSchema.safeParse(
        "Project Plan - v2.0!",
      );

      expect(result.success).toBe(true);
    });
  });

  describe("Minimum length validation", () => {
    it("rejects an empty title", () => {
      const result = titleSchema.safeParse("");

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.flatten().formErrors,
        ).toContain(
          "Please enter a valid title with at least 2 characters and greater than 2 characters.",
        );
      }
    });

    it("rejects a one-character title", () => {
      const result = titleSchema.safeParse("A");

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.flatten().formErrors,
        ).toContain(
          "Please enter a valid title with at least 2 characters and greater than 2 characters.",
        );
      }
    });

    it("accepts a two-character title", () => {
      const result = titleSchema.safeParse("AB");

      expect(result.success).toBe(true);
    });
  });

  describe("Maximum length validation", () => {
    it("rejects a title longer than 50 characters", () => {
      const title = "A".repeat(51);

      const result = titleSchema.safeParse(title);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.flatten().formErrors,
        ).toContain(
          "Please enter a valid title with at least 2 characters and no more than 50 characters.",
        );
      }
    });

    it("accepts a title with exactly 50 characters", () => {
      const title = "A".repeat(50);

      const result = titleSchema.safeParse(title);

      expect(result.success).toBe(true);
    });
  });

  describe("Type validation", () => {
    it("rejects undefined", () => {
      const result = titleSchema.safeParse(undefined);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.issues[0].message,
        ).toBe("Please enter a title.");
      }
    });

    it("rejects null", () => {
      const result = titleSchema.safeParse(null);

      expect(result.success).toBe(false);
    });

    it("rejects a number", () => {
      const result = titleSchema.safeParse(12345);

      expect(result.success).toBe(false);
    });

    it("rejects an object", () => {
      const result = titleSchema.safeParse({
        title: "Project Planning",
      });

      expect(result.success).toBe(false);
    });

    it("rejects an array", () => {
      const result = titleSchema.safeParse([
        "Project Planning",
      ]);

      expect(result.success).toBe(false);
    });

    it("rejects a boolean", () => {
      const result = titleSchema.safeParse(true);

      expect(result.success).toBe(false);
    });
  });

  describe("Error messages", () => {
    it("returns the correct message for invalid string length", () => {
      const result = titleSchema.safeParse("A");

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please enter a valid title with at least 2 characters and greater than 2 characters.",
        );
      }
    });

    it("returns the correct message for a title exceeding 50 characters", () => {
      const result = titleSchema.safeParse(
        "A".repeat(51),
      );

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please enter a valid title with at least 2 characters and no more than 50 characters.",
        );
      }
    });

    it("returns the correct message for a missing title", () => {
      const result = titleSchema.safeParse(undefined);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Please enter a title.",
        );
      }
    });
  });
});