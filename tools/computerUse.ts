import { anthropic } from "@ai-sdk/anthropic";
import { Page } from "@playwright/test";
import { ok, err } from "neverthrow";

type Action =
  | "key"
  | "type"
  | "mouse_move"
  | "left_click"
  | "left_click_drag"
  | "right_click"
  | "middle_click"
  | "double_click"
  | "cursor_position";

type ActionsNeedingCoordinates =
  | "mouse_move"
  | "left_click"
  | "right_click"
  | "middle_click"
  | "left_click_drag";

type ActionsNeedingText = "key" | "type";

export const computerUse = (page: Page) => {
  return anthropic.tools.computer_20241022({
    displayWidthPx: 1920,
    displayHeightPx: 1080,
    execute: async ({ action, coordinate, text }) => {
      console.group("Computer Use");
      console.log({ action, coordinate, text });
      console.groupEnd();

      if (action === "screenshot") {
        const res = await screenshot(page);

        return {
          action: "screenshot" as const,
          data: await screenshot(page),
        };
      }

      if (isActionsNeedingCoordinates(action)) {
        if (!coordinate) {
          return {
            action,
            data: err(`${action} requires coordinates` as const),
          };
        }

        const [x, y] = coordinate;

        switch (action) {
          case "mouse_move": {
            return {
              action: "mouse_move" as const,
              data: await mouseMove(page, x, y),
            };

            // return await mouseMove(page, x, y);
          }

          case "left_click": {
            return {
              action: "left_click" as const,
              data: await leftClick(page, x, y),
            };

            // return await leftClick(page, x, y);
          }

          case "right_click": {
            return {
              action: "right_click" as const,
              data: await rightClick(page, x, y),
            };

            // return await rightClick(page, x, y);
          }

          case "middle_click": {
            return {
              action: "middle_click" as const,
              data: await middleClick(page, x, y),
            };

            // return await middleClick(page, x, y);
          }

          case "left_click_drag": {
            return {
              action: "left_click_drag" as const,
              data: await leftClickDrag(page, x, y),
            };

            // return await leftClickDrag(page, x, y);
          }

          default: {
            return {
              action: "unknown" as const,
              data: err("UNSUPPORTED_ACTION" as const),
            };
          }
        }
      }

      if (isActionsNeedingText(action)) {
        if (!text) {
          return {
            action,
            data: err(`${action} requires text` as const),
          };
        }

        switch (action) {
          case "key": {
            return {
              action: "key" as const,
              data: await key(page, text),
            };

            // return await key(page, text);
          }

          case "type": {
            return {
              action: "type" as const,
              data: await type(page, text),
            };

            // return await type(page, text);
          }

          default: {
            return {
              action: "unknown" as const,
              data: err("UNSUPPORTED_ACTION" as const),
            };
          }
        }
      }

      return {
        action: "unknown" as const,
        data: err("UNSUPPORTED_ACTION" as const),
      };
    },
    experimental_toToolResultContent: (result) => {
      console.group("Computer Use Tool Result");
      console.log(result);
      console.groupEnd();

      if (result.data.isErr()) {
        return [
          {
            type: "text",
            text: result.data.error,
          },
        ];
      }

      if (result.action === "screenshot") {
        return [
          {
            type: "image",
            data: result.data.value,
            mimeType: "image/jpeg",
          },
        ];
      }

      return [
        {
          type: "text",
          text: JSON.stringify(result.data.value),
        },
      ];
    },
  });
};

export const screenshot = async (page: Page) => {
  try {
    const screenshot = await page.screenshot({
      type: "jpeg",
    });

    return ok(screenshot.toString("base64") as string);
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

export const key = async (page: Page, text: string) => {
  try {
    await page.keyboard.type(text);

    return ok({
      success: true,
    });
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

export const type = async (page: Page, text: string) => {
  try {
    await page.keyboard.type(text);

    return ok({
      success: true,
    });
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

export const mouseMove = async (page: Page, x: number, y: number) => {
  try {
    await page.mouse.move(x, y);

    return ok({
      success: true,
    });
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

export const leftClickDrag = async (page: Page, x: number, y: number) => {
  try {
    await page.mouse.down();
    await page.mouse.move(x, y);
    await page.mouse.up();

    return ok({
      success: true,
    });
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

export const leftClick = async (page: Page, x: number, y: number) => {
  try {
    await page.mouse.click(x, y);

    return ok({
      success: true,
    });
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

export const rightClick = async (page: Page, x: number, y: number) => {
  try {
    await page.mouse.click(x, y, { button: "right" });

    return ok({
      success: true,
    });
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

export const middleClick = async (page: Page, x: number, y: number) => {
  try {
    await page.mouse.click(x, y, { button: "middle" });

    return ok({
      success: true,
    });
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

export const doubleClick = async (page: Page, x: number, y: number) => {
  try {
    await page.mouse.dblclick(x, y);

    return ok({
      success: true,
    });
  } catch (e) {
    if (e instanceof Error) {
      return err(e.message);
    }

    return err("SOMETHING WENT WRONG");
  }
};

const isActionsNeedingText = (
  _action: Action
): _action is ActionsNeedingText => {
  const actionsNeedingText = ["key", "type"];

  return actionsNeedingText.includes(_action);
};

const isActionsNeedingCoordinates = (
  _action: Action
): _action is ActionsNeedingCoordinates => {
  const actionsNeedingCoordinates = [
    "mouse_move",
    "left_click",
    "right_click",
    "middle_click",
    "left_click_drag",
  ];

  return actionsNeedingCoordinates.includes(_action);
};
