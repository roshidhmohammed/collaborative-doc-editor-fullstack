import { z } from "zod";
export const titleSchema = z
  .string({
    message: "Please enter a title.",
  })
  .min(2, {
    message:
      "Please enter a valid title with at least 2 characters and greater than 2 characters.",
  })
  .max(50, {
    message:
      "Please enter a valid title with at least 2 characters and no more than 50 characters.",
  });
