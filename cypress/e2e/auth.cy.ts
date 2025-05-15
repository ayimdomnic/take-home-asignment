describe("Authentication", () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.clearLocalStorage()
    })
  
    it("should redirect to sign in page when not authenticated", () => {
      cy.visit("/")
      cy.url().should("include", "/signin")
    })
  
    it("should show validation errors on sign in form", () => {
      cy.visit("/signin")
  
      // Try to submit empty form
      cy.get("button[type='submit']").click()
      cy.contains("Email is required").should("be.visible")
      cy.contains("Password is required").should("be.visible")
  
      // Try with invalid email
      cy.get("input[type='email']").type("invalid-email")
      cy.get("button[type='submit']").click()
      cy.contains("Please enter a valid email address").should("be.visible")
    })
  
    it("should show validation errors on sign up form", () => {
      cy.visit("/signup")
  
      // Try to submit empty form
      cy.get("button[type='submit']").click()
      cy.contains("Name is required").should("be.visible")
      cy.contains("Email is required").should("be.visible")
      cy.contains("Password must be at least 8 characters").should("be.visible")
  
      // Try with mismatched passwords
      cy.get("input[name='name']").type("Test User")
      cy.get("input[type='email']").type("test@example.com")
      cy.get("input[name='password']").type("Password123")
      cy.get("input[name='confirmPassword']").type("Password456")
      cy.get("button[type='submit']").click()
      cy.contains("Passwords do not match").should("be.visible")
    })
  
    it("should navigate between sign in and sign up pages", () => {
      cy.visit("/signin")
      cy.contains("Sign up").click()
      cy.url().should("include", "/signup")
  
      cy.contains("Sign in").click()
      cy.url().should("include", "/signin")
    })
  
    // This test would require mocking the authentication API
    it.skip("should sign in successfully with valid credentials", () => {
      cy.visit("/signin")
  
      cy.get("input[type='email']").type("test@example.com")
      cy.get("input[type='password']").type("Password123")
      cy.get("button[type='submit']").click()
  
      // Should redirect to dashboard
      cy.url().should("eq", Cypress.config().baseUrl + "/")
      cy.contains("My Drive").should("be.visible")
    })
  })
  