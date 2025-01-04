import { tool } from "ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const finishTest = (
  onEnd: (res: { success: boolean; message: string }) => void
) =>
  tool({
    description: "call this function to finish the test",
    execute: async ({ success, message }) => {
      onEnd({ success, message });
    },
    parameters: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  });
