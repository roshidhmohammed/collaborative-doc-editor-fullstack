import { copyToClipboard } from "@/features/docEditor/utils/clipboard";

describe("copyToClipboard", () => {
  let mockWriteText: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWriteText = jest.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: mockWriteText,
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Successful copy", () => {
    it("copies the provided text to the clipboard", async () => {
      const text = "https://example.com/documents/123";

      await copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockWriteText).toHaveBeenCalledWith(text);
    });

    it("resolves successfully when the clipboard write succeeds", async () => {
      await expect(
        copyToClipboard("Hello World"),
      ).resolves.toBeUndefined();
    });

    it("supports an empty string", async () => {
      await copyToClipboard("");

      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockWriteText).toHaveBeenCalledWith("");
    });

    it("supports long text", async () => {
      const text = "a".repeat(5000);

      await copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledWith(text);
    });

    it("supports special characters", async () => {
      const text =
        "https://example.com/doc?id=123&role=EDITOR";

      await copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledWith(text);
    });
  });

  describe("Clipboard API unavailable", () => {
    it("throws when navigator.clipboard is unavailable", async () => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });

      await expect(
        copyToClipboard("Test"),
      ).rejects.toThrow(
        "Clipboard API is not available",
      );

      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it("throws when clipboard.writeText is unavailable", async () => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {},
      });

      await expect(
        copyToClipboard("Test"),
      ).rejects.toThrow(
        "Clipboard API is not available",
      );
    });
  });

  describe("Clipboard write failures", () => {
    it("propagates an error from clipboard.writeText", async () => {
      const error = new Error(
        "Permission denied",
      );

      mockWriteText.mockRejectedValue(error);

      await expect(
        copyToClipboard("Test"),
      ).rejects.toThrow("Permission denied");

      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockWriteText).toHaveBeenCalledWith(
        "Test",
      );
    });

    it("propagates non-Error rejection values", async () => {
      mockWriteText.mockRejectedValue(
        "Clipboard failed",
      );

      await expect(
        copyToClipboard("Test"),
      ).rejects.toBe("Clipboard failed");
    });
  });
});