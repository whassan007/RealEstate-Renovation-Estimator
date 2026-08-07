describe('Contractor Workspace Flow', () => {
  beforeEach(() => {
    // Start fresh
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('displays the empty state for quote requests', () => {
    cy.visit('/contractor');
    cy.contains('No quote requests yet.');
    cy.contains('Create a Guestimate').should('have.attr', 'href', '/');
  });

  it('loads quote requests and builds quotes', () => {
    // Seed local storage with a fake request
    cy.window().then((win) => {
      win.localStorage.setItem('quoteRequests', JSON.stringify([{
        id: '12345',
        address: '999 Testing Ave',
        status: 'Pending',
        property: { sqft: 1500, beds: 3, baths: 2 },
        guestimate: { min: 25000, max: 35000 },
        intelligence_data: {
          confidence_level: 'HIGH',
          confidence_score: 0.95,
          assumptions: ['Standard structural framing'],
          unknowns: ['Hidden water damage'],
          line_items: [
            { item: 'Drywall Repair', quantity: 200, unit: 'SF', material_unit_cost: 1.5, labor_unit_cost: 3.5, source: 'RSMeans', confidence: 0.9 }
          ]
        }
      }]));
    });

    cy.visit('/contractor');
    
    // Select the request
    cy.contains('999 Testing Ave').click();
    
    // Verify intelligence data loaded
    cy.contains('Agent Confidence');
    cy.contains('HIGH (95%)');
    cy.contains('Standard structural framing');
    cy.contains('Hidden water damage');

    // Verify line items and totals
    cy.get('input[value="Drywall Repair"]').should('exist');
    cy.contains('$1,000'); // 200 * (1.5 + 3.5)
    
    // Update Markup
    cy.get('input[type="number"]').last().clear().type('25'); // 25% markup
    
    // Total should update: Direct Cost = $1000. 25% Markup = $250. Client Price = $1250.
    cy.contains('$1,250');
  });

  it('navigates the Cost Transparency Browser', () => {
    cy.visit('/contractor');
    cy.contains('Cost Transparency Browser').click();
    
    // Should display categories
    cy.contains('Additions, Remodeling & Construction', { timeout: 10000 });
    
    // Click an assembly
    cy.contains('Demolition').click();
    
    // Details panel should split into Parts and Installation
    cy.contains('Parts & Materials');
    cy.contains('Installation & Labor');
  });
});
