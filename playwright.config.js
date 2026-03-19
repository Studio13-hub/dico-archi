const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./Test/e2e",
  timeout: 30_000,
  // Keep the suite stable against the local Vercel dev runtime, which is less
  // tolerant to full fan-out than a static file server.
  fullyParallel: false,
  workers: 2,
  reporter: [["list"]],
  webServer: {
    // Use the local Vercel runtime so Playwright exercises both static pages
    // and serverless /api routes in the same way as production.
    command: "vercel dev --listen 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 60_000
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  }
});
