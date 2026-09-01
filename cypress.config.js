// @ts-check
const fs = require("fs");
const path = require("path");
const { defineConfig } = require("cypress");

const PORT = process.env.CYPRESS_PORT || 3000;
const BASE_URL = process.env.CYPRESS_BASE_URL || `http://localhost:${PORT}`;

const FIXTURES_DIR = path.join(__dirname, "cypress", "fixtures");
const EXAMPLE_CREDENTIALS_PATH = path.join(FIXTURES_DIR, "credentials.example.json");
const LOCAL_CREDENTIALS_PATH = path.join(FIXTURES_DIR, "credentials.json");
const PLACEHOLDER_PATTERN = /^REPLACE_WITH_/;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/**
 * The committed dummy/invalid pair always comes from credentials.example.json; the real
 * "valid" account is read from the git-ignored cypress/fixtures/credentials.json when
 * present, falling back to the placeholder example otherwise.
 */
function loadCredentials() {
  const example = readJson(EXAMPLE_CREDENTIALS_PATH);
  if (!fs.existsSync(LOCAL_CREDENTIALS_PATH)) return example;

  const local = readJson(LOCAL_CREDENTIALS_PATH);
  return {
    invalid: { ...example.invalid, ...local.invalid },
    valid: { ...example.valid, ...local.valid },
  };
}

function hasRealValidCredentials(credentials) {
  const email = credentials?.valid?.email || "";
  const password = credentials?.valid?.password || "";
  return Boolean(email && password && !PLACEHOLDER_PATTERN.test(email) && !PLACEHOLDER_PATTERN.test(password));
}

module.exports = defineConfig({
  e2e: {
    baseUrl: BASE_URL,
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/**/*.cy.js",
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on) {
      on("task", {
        loadCredentials() {
          const credentials = loadCredentials();
          return { credentials, hasRealAccount: hasRealValidCredentials(credentials) };
        },
      });
    },
  },
});
