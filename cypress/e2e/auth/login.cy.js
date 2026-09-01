/// <reference types="cypress" />
const { LoginPage } = require("../../pages/LoginPage");

/**
 * End-to-end login flow against app/(routes)/(auth)/page.js.
 *
 * The last case needs a real account: copy cypress/fixtures/credentials.example.json to
 * cypress/fixtures/credentials.json (git-ignored) and fill in "valid.email" / "valid.password".
 * Without it, that case self-skips instead of failing the run.
 */
describe("Login", () => {
  const loginPage = new LoginPage();
  let credentials;
  let hasRealAccount;

  before(() => {
    cy.task("loadCredentials").then((result) => {
      credentials = result.credentials;
      hasRealAccount = result.hasRealAccount;
    });
  });

  beforeEach(() => {
    loginPage.visit();
  });

  it("1. shows the sign-in title, forgot password link and login form", () => {
    cy.title().should("match", /2nd Careers/i);
    loginPage.heading.should("be.visible");
    loginPage.forgotPasswordLink.should("be.visible");
    loginPage.emailInput.should("be.visible");
    loginPage.passwordInput.should("be.visible");
    loginPage.signInButton.should("be.visible");
  });

  it("2. rejects an empty submit with validation errors", () => {
    loginPage.submit();
    loginPage.emailRequiredError.should("be.visible");
    loginPage.passwordRequiredError.should("be.visible");
    cy.location("pathname").should("eq", "/");
  });

  it("3. rejects wrong dummy username/password", () => {
    loginPage.submitCredentials(credentials.invalid);
    loginPage.signInButton.should("be.enabled");
    cy.location("pathname").should("eq", "/");
  });

  it("4-5. logs in with valid credentials, returns an access token, and redirects", function () {
    if (!hasRealAccount) {
      cy.log("Skipped: add a real test account to cypress/fixtures/credentials.json (see credentials.example.json).");
      this.skip();
    }

    cy.intercept("POST", "**/login").as("loginRequest");
    loginPage.submitCredentials(credentials.valid);

    cy.wait("@loginRequest").then(({ response }) => {
      expect(response.statusCode).to.be.within(200, 299);
      expect(response.body.error_code).to.eq(0);
      expect(response.body.data?.access_token).to.be.a("string").and.not.be.empty;
    });

    const redirectPath = credentials.valid.expectedRedirectPath || "/professional/home";
    cy.location("pathname", { timeout: 15000 }).should("include", redirectPath);
  });
});
