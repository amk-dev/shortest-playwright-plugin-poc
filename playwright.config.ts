import { PlaywrightTestConfig } from "@playwright/test";
import CustomReporter from "./customReporter";

const config: PlaywrightTestConfig = {
  workers: 3,
  use: {
    headless: false, // Run in headed mode
  },
  timeout: 30000,
  fullyParallel: true,
  reporter: "./customReporter.ts",
};

export default config;
