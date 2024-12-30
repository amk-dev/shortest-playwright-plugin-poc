import { test } from "./playwright-plugin";

test("google tests", async ({ shortest }) => {
  shortest.config({ baseURL: "https://google.com" });

  await shortest.ai(
    "make sure google.com has a text box and the user is not signed in"
  );
});

test.only("etherscan tests", async ({ shortest }) => {
  shortest.config({ baseURL: "https://etherscan.io/" });

  await shortest.ai(`make sure the price of ethereum is above $2500`);
});
