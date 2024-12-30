import { expect, Page, test as base } from "@playwright/test";
import { Anthropic } from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { BetaContentBlockParam } from "@anthropic-ai/sdk/resources/beta/index.mjs";

const TestResults = z.object({
  success: z.boolean(),
  message: z.string(),
  artifact: z.string(),
});

export class Shortest {
  constructor(public readonly page: Page) {}

  _config: {
    baseURL: string;
  } | null = null;

  async ai(instruction: string) {
    if (!this._config) {
      throw new Error("No baseURL configured");
    }

    await this.page.goto(this._config.baseURL);

    await createComputerUseSession(instruction, this.page);
  }

  async config(config: { baseURL: string }) {
    this._config = config;
  }
}

export const test = base.extend<{ shortest: Shortest }>({
  shortest: async ({ page }, use) => {
    await use(new Shortest(page));
  },
});

// -------------------------------------------- Computer use stuff --------------------------------------------

const anthropic = new Anthropic();

const prompt = (test_description: string) => {
  return `You are an AI-powered end-to-end tester. Your goal is to run a test that has been defined using natural language. You will use a computer use tool to perform actions on the system being tested.
  the chrome browser will be already open and you can use it as your browser.

Here is the test description:
<test_description>
${test_description}
</test_description>

To interact with the system, you will use the following computer use tool:`;
};

const runComputerUse = async (
  existingMessages: Anthropic.Beta.Messages.BetaMessageParam[]
) => {
  const message = await anthropic.beta.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    tools: [
      {
        type: "custom",
        name: "screenshot",
        input_schema: {
          type: "object",
        },
        description: "Take a screenshot of the current screen",
      },
      {
        type: "computer_20241022",
        name: "computer",
        display_width_px: 1024,
        display_height_px: 768,
        display_number: 1,
      },
      {
        type: "custom",
        name: "finishTestRun",
        input_schema: {
          type: "object",
          properties: {
            results: zodToJsonSchema(TestResults),
          },
        },
      },
    ],
    messages: existingMessages,
    betas: ["computer-use-2024-10-22"],
  });

  return message;
};

const createComputerUseSession = async (instruction: string, page: Page) => {
  let runFinished = false;

  const finishTestRun = async (results: z.infer<typeof TestResults>) => {
    if (results.success) {
      runFinished = true;

      return true;
    }

    runFinished = true;

    throw new Error(results.message);
  };

  const screenshot = async () => {
    const screenshot = await page.screenshot();
    const base64 = screenshot.toString("base64");

    return base64 as string;
  };

  const existingMessages: Anthropic.Beta.Messages.BetaMessageParam[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt(instruction),
        },
        {
          type: "image",
          source: {
            type: "base64",
            data: await screenshot(),
            media_type: "image/png",
          },
        },
      ],
    },
  ];

  while (true) {
    const res = await runComputerUse(existingMessages);

    const message = res.content;

    message.forEach((m) => {
      if (m.type === "tool_use" && m.name === "finishTestRun") {
        const args = m.input;

        const parsedArgs = TestResults.safeParse(args.results);

        if (!parsedArgs.success) {
          throw new Error("TEST_FAILED_TO_RUN");
        }

        finishTestRun(parsedArgs.data);

        return;
      }
    });

    if (runFinished) {
      break;
    }

    throw new Error(
      "DID NOT COMPLETE IN ONE STEP, THIS IS A TOY IMPLEMENTATION EXPECTED TO FINISH IN ONE STEP"
    );
  }
};
