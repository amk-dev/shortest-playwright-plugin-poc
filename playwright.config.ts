import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
    headless: false, // Run in headed mode
  },
  timeout: 30000,
};

export default config;
