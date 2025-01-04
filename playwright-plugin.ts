import { Page, test as base, TestInfo } from "@playwright/test";
import { z } from "zod";
import { CoreMessage, generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { computerUse, screenshot } from "./tools/computerUse";
import { finishTest } from "./tools/test";
import { navigateTool } from "./tools/navigate";

const TestResults = z.object({
  success: z.boolean(),
  message: z.string(),
  artifact: z.string(),
});

export class Shortest {
  constructor(
    public readonly page: Page,
    private readonly testInfo?: TestInfo
  ) {}

  _config: {
    baseURL: string;
  } | null = null;

  async ai(instruction: string, additionalInfo: { [key: string]: any } = {}) {
    this.testInfo.this.page.setViewportSize({
      width: 1920,
      height: 1080,
    });

    const res = await createComputerUseSession(
      instruction,
      additionalInfo,
      this.page
    );

    if (!res?.success) {
      throw new Error(res?.message);
    }

    return res;
  }

  async config(config: { baseURL: string }) {
    this._config = config;
  }
}

export const test = base.extend<{ shortest: Shortest }>({
  shortest: async ({ page }, use, testInfo) => {
    await use(new Shortest(page, testInfo));
  },
});

// -------------------------------------------- Computer use stuff --------------------------------------------

// const anthropic = new Anthropic();

const prompt = (
  test_description: string,
  additionalInfo: {
    [key: string]: any;
  }
) => {
  return `You are an ai powered end to end tester. you need to act according to the user's instructions. you dont have to use computer use mandatory. but only when needed. we have tests that does not require computer use. keep that in mind.

Here is the test description:
<test_description>
${test_description}
</test_description>

Here is the additional information passed by the user:
<additional_info>
${JSON.stringify(additionalInfo, null, 2)}
</additional_info>
`;
};

const runComputerUse = async (existingMessages: CoreMessage[], page: Page) => {
  let testRes: {
    success: boolean;
    message: string;
  } | null = null;

  const res = await generateText({
    model: anthropic("claude-3-5-sonnet-latest"),
    tools: {
      computer: computerUse(page),
      finishTest: finishTest((res) => {
        testRes = {
          ...res,
        };
      }),
      navigate: navigateTool(page),
    },
    messages: existingMessages,
    maxSteps: 10, // a big number
    experimental_telemetry: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
    },
  });

  return testRes as { success: boolean; message: string } | null;
};

const createComputerUseSession = async (
  instruction: string,
  additionalInfo: { [key: string]: any } = {},
  page: Page
) => {
  const initialScreenshot = await screenshot(page);

  if (initialScreenshot.isErr()) {
    throw new Error(initialScreenshot.error);
  }

  const existingMessages: CoreMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt(instruction, additionalInfo),
        },
        {
          type: "image",
          image: initialScreenshot.value,
          mimeType: "image/jpeg",
        },
      ],
    },
  ];

  return await runComputerUse(existingMessages, page);
};
