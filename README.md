# 2nd Careers - E2E Test Suite

Cypress automation for the [2ndcareers-frontend](https://github.com/AdraProductStudio/2ndcareers-frontend) app.
This repo is meant to be checked out as a **git submodule** inside that app (e.g. at `e2e-tests/`),
so it always sits next to the app code it tests while keeping its own dependencies isolated.

## Structure

```
cypress/
  e2e/
    auth/
      login.cy.js               Login flow: page checks, validation, wrong creds, real login + token, redirect
  fixtures/
    credentials.example.json    Committed template + safe dummy "invalid" credentials
    credentials.json            Git-ignored - your real test account goes here (copy the example)
  pages/
    LoginPage.js                 Page Object Model - selectors + actions for the login page
  support/
    e2e.js                       Cypress support file, loaded before every spec
cypress.config.js                Also registers the loadCredentials task (reads the fixtures above)
```

## Setup

```bash
npm install
cp cypress/fixtures/credentials.example.json cypress/fixtures/credentials.json
# edit cypress/fixtures/credentials.json -> fill in "valid.email" / "valid.password" with a real test account
```

## Running

Run from this folder, or from the parent app's repo root via its `npm run test:e2e*` wrapper scripts.
Each script starts the app itself (`npm run local` in the parent directory) if it isn't already running.

| Command | What it does |
|---|---|
| `npm test` | Headless run in Chrome |
| `npm run test:headed` | Visible Chrome, stays open after the run (`--no-exit`) |
| `npm run test:open` | Cypress App - interactive runner with time-travel debugging |

## Adding new tests

- One `*.cy.js` per page/flow inside `cypress/e2e/<area>/`.
- One Page Object per page inside `cypress/pages/`, reused across specs.
- Never hardcode real credentials or tokens in a spec - read them via `cy.task("loadCredentials")`
  (backed by `cypress.config.js`) so secrets stay out of git history.
