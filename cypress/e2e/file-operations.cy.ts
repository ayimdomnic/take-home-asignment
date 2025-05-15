describe("File Operations", () => {
    beforeEach(() => {
      // Mock authentication
      cy.intercept("GET", "/api/auth/session", { fixture: "session.json" }).as("session")
  
      // Mock API responses
      cy.intercept("GET", "/api/files*", { fixture: "files.json" }).as("getFiles")
      cy.intercept("GET", "/api/folders*", { fixture: "folders.json" }).as("getFolders")
  
      // Visit the dashboard
      cy.visit("/")
      cy.wait(["@session", "@getFiles", "@getFolders"])
    })
  
    it("should display files and folders", () => {
      cy.get("[data-testid='file-grid']").should("exist")
      cy.contains("Document.pdf").should("be.visible")
      cy.contains("Images").should("be.visible")
    })
  
    it("should navigate to a folder when clicked", () => {
      cy.intercept("GET", "/api/files?folderId=folder1*", { fixture: "folder1-files.json" }).as("getFolderFiles")
  
      cy.contains("Images").click()
      cy.wait("@getFolderFiles")
  
      cy.url().should("include", "?folder=folder1")
      cy.contains("vacation.jpg").should("be.visible")
    })
  
    it("should toggle between grid and list views", () => {
      // Default is grid view
      cy.get("[data-testid='file-grid']").should("exist")
  
      // Switch to list view
      cy.get("[aria-label='List view']").click()
      cy.get("table").should("exist")
  
      // Switch back to grid view
      cy.get("[aria-label='Grid view']").click()
      cy.get("[data-testid='file-grid']").should("exist")
    })
  
    it("should star a file", () => {
      cy.intercept("POST", "/api/files/*/star", {
        statusCode: 200,
        body: { success: true, data: { starred: true } },
      }).as("starFile")
  
      // Open file actions menu
      cy.contains("Document.pdf").parent().parent().find("[data-testid='file-actions']").click()
  
      // Click star option
      cy.contains("Add to starred").click()
  
      cy.wait("@starFile")
      cy.get("@starFile.all").should("have.length", 1)
  
      // Refresh files list
      cy.intercept("GET", "/api/files*", {
        fixture: "files-starred.json",
      }).as("getUpdatedFiles")
  
      cy.get("[aria-label='Refresh']").click()
      cy.wait("@getUpdatedFiles")
  
      // Verify star icon is visible
      cy.get("[data-testid='star-icon']").should("exist")
    })
  
    it("should move a file to trash", () => {
      cy.intercept("POST", "/api/files/*/trash", {
        statusCode: 200,
        body: { success: true },
      }).as("trashFile")
  
      // Open file actions menu
      cy.contains("Document.pdf").parent().parent().find("[data-testid='file-actions']").click()
  
      // Click trash option
      cy.contains("Move to trash").click()
  
      // Confirm in dialog
      cy.contains("Are you sure").should("be.visible")
      cy.contains("button", "Move to trash").click()
  
      cy.wait("@trashFile")
  
      // Refresh files list (now without the trashed file)
      cy.intercept("GET", "/api/files*", {
        fixture: "files-after-trash.json",
      }).as("getUpdatedFiles")
  
      cy.get("[aria-label='Refresh']").click()
      cy.wait("@getUpdatedFiles")
  
      // Verify file is no longer visible
      cy.contains("Document.pdf").should("not.exist")
    })
  
    it("should share a file", () => {
      cy.intercept("POST", "/api/files/*/share", {
        statusCode: 200,
        body: { success: true },
      }).as("shareFile")
  
      cy.intercept("GET", "/api/files/*/shares", {
        statusCode: 200,
        body: { success: true, data: [] },
      }).as("getShares")
  
      // Open file actions menu
      cy.contains("Document.pdf").parent().parent().find("[data-testid='file-actions']").click()
  
      // Click share option
      cy.contains("Share").click()
  
      cy.wait("@getShares")
  
      // Fill share form
      cy.get("input[type='email']").type("friend@example.com")
      cy.get("button").contains("Share").click()
  
      cy.wait("@shareFile")
  
      // Verify success message
      cy.contains("File shared successfully").should("be.visible")
    })
  })
  