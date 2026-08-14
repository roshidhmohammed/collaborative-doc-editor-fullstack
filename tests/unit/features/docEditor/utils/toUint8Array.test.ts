import { toUint8Array } from "@/features/docEditor/utils/toUint8Array";

describe("toUint8Array", () => {
  describe("Uint8Array input", () => {
    it("returns the same Uint8Array instance", () => {
      const value = new Uint8Array([1, 2, 3, 4]);

      const result = toUint8Array(value);

      expect(result).toBe(value);
      expect(result).toEqual(
        new Uint8Array([1, 2, 3, 4]),
      );
    });

    it("handles an empty Uint8Array", () => {
      const value = new Uint8Array();

      const result = toUint8Array(value);

      expect(result).toBe(value);
      expect(result).toHaveLength(0);
    });
  });

  describe("ArrayBuffer input", () => {
    it("converts an ArrayBuffer to Uint8Array", () => {
      const buffer = new ArrayBuffer(4);

      const source = new Uint8Array(buffer);

      source.set([10, 20, 30, 40]);

      const result = toUint8Array(buffer);

      expect(result).toBeInstanceOf(Uint8Array);

      expect(Array.from(result)).toEqual([
        10,
        20,
        30,
        40,
      ]);
    });

    it("returns an empty Uint8Array for an empty ArrayBuffer", () => {
      const buffer = new ArrayBuffer(0);

      const result = toUint8Array(buffer);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toHaveLength(0);
    });

    it("creates a new Uint8Array instead of returning the ArrayBuffer", () => {
      const buffer = new ArrayBuffer(3);

      const result = toUint8Array(buffer);

      expect(result).not.toBe(buffer);
      expect(result).toBeInstanceOf(Uint8Array);
    });
  });

  describe("Array input", () => {
    it("converts a number array to Uint8Array", () => {
      const value = [1, 2, 3, 255];

      const result = toUint8Array(value);

      expect(result).toBeInstanceOf(Uint8Array);

      expect(Array.from(result)).toEqual([
        1,
        2,
        3,
        255,
      ]);
    });

    it("handles an empty array", () => {
      const value: number[] = [];

      const result = toUint8Array(value);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toHaveLength(0);
    });

    it("converts values according to Uint8Array semantics", () => {
      const value = [0, 128, 255];

      const result = toUint8Array(value);

      expect(Array.from(result)).toEqual([
        0,
        128,
        255,
      ]);
    });
  });

  describe("Buffer-style input", () => {
    it("converts a Buffer-style object to Uint8Array", () => {
      const value = {
        type: "Buffer",
        data: [1, 2, 3, 4],
      };

      const result = toUint8Array(value);

      expect(result).toBeInstanceOf(Uint8Array);

      expect(Array.from(result)).toEqual([
        1,
        2,
        3,
        4,
      ]);
    });

    it("handles an empty Buffer-style object", () => {
      const value = {
        type: "Buffer",
        data: [],
      };

      const result = toUint8Array(value);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toHaveLength(0);
    });

    it("does not accept an object with the wrong type", () => {
      const value = {
        type: "ArrayBuffer",
        data: [1, 2, 3],
      };

      expect(() =>
        toUint8Array(value as any),
      ).toThrow(
        "Unsupported binary Yjs update",
      );
    });

    it("does not accept a Buffer-style object with non-array data", () => {
      const value = {
        type: "Buffer",
        data: "1,2,3",
      };

      expect(() =>
        toUint8Array(value as any),
      ).toThrow(
        "Unsupported binary Yjs update",
      );
    });
  });

  describe("Unsupported values", () => {
    it("throws for null", () => {
      expect(() =>
        toUint8Array(null as any),
      ).toThrow(
        "Unsupported binary Yjs update",
      );
    });

    it("throws for undefined", () => {
      expect(() =>
        toUint8Array(undefined as any),
      ).toThrow(
        "Unsupported binary Yjs update",
      );
    });

    it("throws for a string", () => {
      expect(() =>
        toUint8Array("binary-data" as any),
      ).toThrow(
        "Unsupported binary Yjs update",
      );
    });

    it("throws for a number", () => {
      expect(() =>
        toUint8Array(123 as any),
      ).toThrow(
        "Unsupported binary Yjs update",
      );
    });

    it("throws for a plain object", () => {
      expect(() =>
        toUint8Array({} as any),
      ).toThrow(
        "Unsupported binary Yjs update",
      );
    });

    it("throws for an object with unrelated properties", () => {
      expect(() =>
        toUint8Array({
          foo: "bar",
          data: [1, 2, 3],
        } as any),
      ).toThrow(
        "Unsupported binary Yjs update",
      );
    });
  });

  describe("Error message", () => {
    it("uses the expected error message for unsupported input", () => {
      expect(() =>
        toUint8Array({ invalid: true } as any),
      ).toThrow(
        new Error(
          "Unsupported binary Yjs update",
        ),
      );
    });
  });
});