// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node server/server.js',
    url: 'http://localhost:3000/login',
    reuseExistingServer: true,
    timeout: 15000,
  },
  projects: [
    {
      name: 'msedge',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'msedge'
      },
    },
  ],
});
