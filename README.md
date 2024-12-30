### How to run

1. either set ANTHROPIC_API_KEY environment variable, or add an `apiKey` param where `new Anthropic()` is called in `playwright-plugin.ts`
2. `pnpm install`
3. the example tests are in `aistuff.test.ts`, its just a normal test file, any playwright features should work as expected
4. `pnpm exec playwright test .` to run the tests

> Note: This is a super simple POC, things may break, and the code is trash.
