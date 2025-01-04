import { expect } from "playwright/test";
import { test } from "./playwright-plugin";

test.only("google tests", async ({ shortest, page }) => {
  test.slow();

  const res = await fetch("https://httpbin.org/post", {
    method: "POST",
    body: JSON.stringify({
      name: "akash",
      expect: ["student", "developer"],
    }),
  });

  const resJson = await res.json();

  await shortest.ai("make sure akash is not a student", {
    resJson,
  });

  await shortest.ai(
    "go to google.com and make sure it has a text box and the user is not signed in"
  );
});

test("etherscan tests", async ({ shortest }) => {
  test.slow();

  await shortest.ai(
    `go to etherscan and make sure the price of ethereum is above $10000`
  );
});
