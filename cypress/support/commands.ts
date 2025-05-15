/// <reference types="cypress" />

// Custom command to login programmatically
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password') => {
    cy.session([email, password], () => {
      cy.intercept('POST', '/api/auth/callback/credentials').as('loginRequest');
      cy.visit('/signin');
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });
  
  // Custom command to create a folder
  Cypress.Commands.add('createFolder', (folderName) => {
    cy.intercept('POST', '/api/folders').as('createFolder');
    cy.contains('button', 'New Folder').click();
    cy.get('input#name').type(folderName);
    cy.contains('button', 'Create').click();
    cy.wait('@createFolder');
  });
  
  // Custom command to upload a file
  Cypress.Commands.add('uploadFile', (fileName, fileType, fileContent) => {
    cy.intercept('POST', '/api/files').as('uploadFile');
    cy.get('input[type="file"]').uploadFile(
      fileContent,
      fileName,
      fileType,
    );
    cy.wait('@uploadFile');
  });
  
  // Custom command to star a file
  Cypress.Commands.add('starFile', (fileName) => {
    cy.contains(fileName)
      .parents('[data-testid="file-item"]')
      .find('[data-testid="file-actions"]')
      .click();
    cy.contains('Add to starred').click();
  });
  
  // Custom command to delete a file
  Cypress.Commands.add('deleteFile', (fileName) => {
    cy.contains(fileName)
      .parents('[data-testid="file-item"]')
      .find('[data-testid="file-actions"]')
      .click();
    cy.contains('Move to trash').click();
    cy.contains('button', 'Move to trash').click();
  });
  
  // Declare global Cypress types
  declare global {
    namespace Cypress {
      interface Chainable {
        login(email?: string, password?: string): Chainable<void>;
        createFolder(folderName: string): Chainable<void>;
        uploadFile(fileName: string, fileType: string, fileContent: string): Chainable<void>;
        starFile(fileName: string): Chainable<void>;
        deleteFile(fileName: string): Chainable<void>;
      }
    }
  }
  
  // This is to silence ESLint about this being a module
  export {};
  