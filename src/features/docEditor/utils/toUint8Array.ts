import { BinaryValue } from "../types/docEditor";

export function toUint8Array(value: BinaryValue): Uint8Array {
  if (value instanceof Uint8Array) {
    return value;
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  if (Array.isArray(value)) {
    return new Uint8Array(value);
  }

  if (value && value.type === "Buffer" && Array.isArray(value.data)) {
    return new Uint8Array(value.data);
  }

  throw new Error("Unsupported binary Yjs update");
}
