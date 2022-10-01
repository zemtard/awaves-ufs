describe("Endpoint tests", () => {
  it("System status check online", () => {
    cy.request("GET", "http://localhost:" + Cypress.env("port") + "/status").then((response) => {
      expect(response.body).to.contain("im online");
      expect(response.status).to.eq(200);
    });
  });

  it("Custom data can be returned", () => {
    cy.request("OPTIONS", "http://localhost:" + Cypress.env("port") + "/custom").then((response) => {
      expect(response.body).to.contain("GET");
    });
  });

  it("User data can be returned", () => {
    cy.request("OPTIONS", "http://localhost:" + Cypress.env("port") + "/userdata").then((response) => {
      expect(response.body).to.contain("GET");
    });
  });

  it("User data can be filtered by version", () => {
    cy.request("OPTIONS", "http://localhost:" + Cypress.env("port") + "/userdata/version=test").then((response) => {
      expect(response.body).to.contain("GET");
    });
  });

  it("Custom data can be filtered by version", () => {
    cy.request("OPTIONS", "http://localhost:" + Cypress.env("port") + "/custom/version=test").then((response) => {
      expect(response.body).to.contain("GET");
    });
  });

  it("Custom data can be filtered by label", () => {
    cy.request("OPTIONS", "http://localhost:" + Cypress.env("port") + "/custom/label=test").then((response) => {
      expect(response.body).to.contain("GET");
    });
  });
});
