import { Page } from "@playwright/test";
import { z } from "zod";
import { ok, err } from "neverthrow";
import { tool } from "ai";

const navigate = async (url: string, page: Page) => {
  try {
    await page.goto(url);
    return ok("Navigated to " + url);
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

const navigateToolSchema = z.object({
  url: z.string().describe("The URL to navigate to"),
});

export const navigateTool = (page: Page) =>
  tool({
    parameters: navigateToolSchema,
    description: "Navigate to a URL",
    execute: async ({ url }) => navigate(url, page),
  });
