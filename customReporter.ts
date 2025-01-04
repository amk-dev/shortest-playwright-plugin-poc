import {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
  FullConfig,
} from "@playwright/test/reporter";

class CustomReporter implements Reporter {
  private entries: Array<{
    title: string;
    status: string;
    message?: string;
    timestamp: string;
  }> = [];

  onBegin(config: FullConfig) {
    this.entries.push({
      title: "Test Run Started",
      status: "info",
      message: `Running ${config.projects.length} projects`,
      timestamp: new Date().toISOString(),
    });
  }

  onTestBegin(test: TestCase) {
    this.entries.push({
      title: test.title,
      status: "running",
      timestamp: new Date().toISOString(),
    });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.entries.push({
      title: test.title,
      status: result.status,
      message: result.error?.message,
      timestamp: new Date().toISOString(),
    });
  }

  onEnd(result: FullResult) {
    this.entries.push({
      title: "Test Run Completed",
      status: result.status,
      message: `Status: ${result.status}`,
      timestamp: new Date().toISOString(),
    });

    // You can customize how to output the entries
    console.log("\nTest Run Report:");
    this.entries.forEach((entry) => {
      console.log(
        `[${entry.timestamp}] ${entry.title} - ${entry.status}${
          entry.message ? ` - ${entry.message}` : ""
        }`
      );
    });
  }

  // Add a custom method to add entries programmatically
  addEntry(title: string, status: string, message?: string) {
    this.entries.push({
      title,
      status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

export default CustomReporter;
