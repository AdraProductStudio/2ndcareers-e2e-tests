// @ts-check

/**
 * Page Object for the "Sign in to 2nd Careers" page (app/(routes)/(auth)/page.js in the
 * main frontend repo). Keeps selectors in one place so a markup change only needs updating here.
 * Getters return fresh cy.get()/cy.contains() chains on each access, per Cypress's own
 * recommendation against holding on to stale command chains.
 */
class LoginPage {
  visit() {
    cy.visit("/");
  }

  get heading() {
    return cy.contains("h3", "Sign in to 2nd Careers");
  }

  get forgotPasswordLink() {
    return cy.contains("a", "Forgot password?");
  }

  get emailInput() {
    return cy.get('input[name="email"]');
  }

  get passwordInput() {
    return cy.get('input[name="password"]');
  }

  get signInButton() {
    return cy.contains("button", "Sign in Securely");
  }

  get emailRequiredError() {
    return cy.contains("Email id is required");
  }

  get passwordRequiredError() {
    return cy.contains("Password is required");
  }

  fillCredentials({ email = "", password = "" } = {}) {
    this.emailInput.clear();
    if (email) this.emailInput.type(email, { log: false });
    this.passwordInput.clear();
    if (password) this.passwordInput.type(password, { log: false });
    return this;
  }

  submit() {
    this.signInButton.click();
    return this;
  }

  submitCredentials(credentials) {
    this.fillCredentials(credentials);
    this.submit();
    return this;
  }
}

module.exports = { LoginPage };
