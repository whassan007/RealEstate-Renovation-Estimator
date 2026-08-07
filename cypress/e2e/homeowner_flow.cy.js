describe('Homeowner Lead Generation Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    // Clear local storage to ensure a clean state
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('completes the core lead capture form smoothly', () => {
    // Wait for the map to load or the initial state
    cy.get('input[type="text"]').should('be.visible');

    // Type a location and hit enter
    cy.get('input[type="text"]').type('Montreal{enter}');

    // Wait for results
    cy.contains('results visible in map area', { timeout: 10000 });

    // Click the map to drop a pin and select a property
    cy.get('.leaflet-container').click();

    // Verify property selected and Walkthrough appears
    cy.contains('Property Intelligence');
    
    // Complete Kitchen walkthrough
    cy.contains('Kitchen Renovation');
    cy.contains('Yes').click(); // Kitchen

    // Kitchen scope
    cy.contains('What are you changing in the Kitchen?');
    cy.contains('Everything').click(); // Everything

    // Layout changes
    cy.contains('Are you moving plumbing or changing the layout?');
    cy.contains('Yes').click(); // Yes

    // Quality
    cy.contains('Scenario Modeling: Quality Level');
    cy.contains('Standard (Quartz)').click(); // Standard

    // Estimate generation should happen automatically
    // Verify Estimate Comprehension
    cy.contains('Estimated Range', { timeout: 15000 }).should('be.visible');
    cy.contains('Major Cost Drivers');
    cy.contains('Request Detailed Quote');
    
    // Request Quote
    cy.contains('Request Detailed Quote').click({ force: true });
    cy.contains('Quote Requested!');
  });
});
