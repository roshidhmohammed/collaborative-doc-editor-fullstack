import {
  uint8ArrayToBase64,
  base64ToUint8Array,
} from "@/lib/realtime-updates/protocol";

describe("uint8ArrayToBase64", () => {
  it("converts an empty Uint8Array to an empty Base64 string", () => {
    const input = new Uint8Array([]);

    const result = uint8ArrayToBase64(input);

    expect(result).toBe("");
  });

  it("converts a Uint8Array to Base64", () => {
    const input = new Uint8Array([72, 101, 108, 108, 111]);

    const result = uint8ArrayToBase64(input);

    expect(result).toBe("SGVsbG8=");
  });

  it("handles a single byte", () => {
    const input = new Uint8Array([65]);

    const result = uint8ArrayToBase64(input);

    expect(result).toBe("QQ==");
  });

  it("handles binary values from 0 to 255", () => {
    const input = new Uint8Array([0, 1, 2, 127, 128, 254, 255]);

    const result = uint8ArrayToBase64(input);

    expect(result).toBe(
      "AAECf4D+/w==",
    );
  });

  it("returns a string", () => {
    const input = new Uint8Array([1, 2, 3]);

    const result = uint8ArrayToBase64(input);

    expect(typeof result).toBe("string");
  });
});

describe("base64ToUint8Array", () => {
  it("converts an empty Base64 string to an empty Uint8Array", () => {
    const result = base64ToUint8Array("");

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new Uint8Array([]));
  });

  it("converts Base64 to Uint8Array", () => {
    const result = base64ToUint8Array("SGVsbG8=");

    expect(result).toEqual(
      new Uint8Array([72, 101, 108, 108, 111]),
    );
  });

  it("handles a single byte", () => {
    const result = base64ToUint8Array("QQ==");

    expect(result).toEqual(
      new Uint8Array([65]),
    );
  });

  it("handles binary values from 0 to 255", () => {
    const result = base64ToUint8Array(
      "AAECf4D+/w==",
    );

    expect(result).toEqual(
      new Uint8Array([0, 1, 2, 127, 128, 254, 255]),
    );
  });

  it("returns a Uint8Array", () => {
    const result = base64ToUint8Array("AQID");

    expect(result).toBeInstanceOf(Uint8Array);
  });
});

describe("Base64 ↔ Uint8Array round trip", () => {
  it("preserves the original data after conversion", () => {
    const original = new Uint8Array([
      0,
      1,
      2,
      10,
      50,
      100,
      127,
      128,
      200,
      254,
      255,
    ]);

    const base64 = uint8ArrayToBase64(original);
    const result = base64ToUint8Array(base64);

    expect(result).toEqual(original);
  });

  it("preserves text bytes after conversion", () => {
    const original = new TextEncoder().encode(
      "Collaborative document editor",
    );

    const base64 = uint8ArrayToBase64(original);
    const result = base64ToUint8Array(base64);

    expect(result).toEqual(original);
  });

  it("preserves Yjs-like binary data", () => {
    const original = new Uint8Array([
      1,
      0,
      255,
      34,
      128,
      64,
      12,
      99,
      200,
      17,
    ]);

    const encoded = uint8ArrayToBase64(original);
    const decoded = base64ToUint8Array(encoded);

    expect(decoded).toEqual(original);
  });
});

describe("Base64 validation behavior", () => {
  it("throws for invalid Base64 input", () => {
    expect(() =>
      base64ToUint8Array("%%%invalid%%%"),
    ).toThrow();
  });
});