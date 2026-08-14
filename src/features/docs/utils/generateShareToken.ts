import "server-only";

import { createHash, randomUUID } from "crypto";

export const generateShareToken = () => {
  return createHash("sha256")
    .update(`${randomUUID()}-${Date.now()}`)
    .digest("hex");
};
