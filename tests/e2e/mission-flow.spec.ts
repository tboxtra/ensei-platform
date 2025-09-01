describe('Mission Flow', () => {
    beforeEach(() => {
        cy.visit('/missions/create');
    });

    it('should create a degen mission with correct pricing calculations', () => {
        // Select platform
        cy.contains('Twitter').click();

        // Select mission type
        cy.contains('Engage').click();

        // Select degen model
        cy.contains('Degen').click();

        // Select tasks
        cy.contains('Like Post').click();
        cy.contains('Retweet').click();

        // Set duration to 8h
        cy.get('select').select('8h - $150');

        // Set winners cap to 3
        cy.get('input[type="number"]').clear().type('3');

        // Verify premium is off by default
        cy.get('[data-testid="premium-toggle"]').should('not.be.checked');

        // Check pricing calculations
        cy.contains('Total Cost:').should('contain', '$150.00');
        cy.contains('Honors Pool:').should('contain', '33,750 Honors');
        cy.contains('Per Winner:').should('contain', '11,250 Honors');
    });

    it('should apply 5x multiplier when premium is toggled', () => {
        // Select platform
        cy.contains('Twitter').click();

        // Select mission type
        cy.contains('Engage').click();

        // Select degen model
        cy.contains('Degen').click();

        // Select tasks
        cy.contains('Like Post').click();
        cy.contains('Retweet').click();

        // Set duration to 8h
        cy.get('select').select('8h - $150');

        // Set winners cap to 3
        cy.get('input[type="number"]').clear().type('3');

        // Toggle premium on
        cy.get('[data-testid="premium-toggle"]').click();

        // Verify premium is on
        cy.get('[data-testid="premium-toggle"]').should('be.checked');

        // Check pricing calculations with 5x multiplier
        cy.contains('Total Cost:').should('contain', '$750.00');
        cy.contains('Honors Pool:').should('contain', '168,750 Honors');
        cy.contains('Per Winner:').should('contain', '56,250 Honors');
        cy.contains('Premium Multiplier:').should('contain', '×5');
    });

    it('should validate winner cap limits', () => {
        // Select platform
        cy.contains('Twitter').click();

        // Select mission type
        cy.contains('Engage').click();

        // Select degen model
        cy.contains('Degen').click();

        // Select tasks
        cy.contains('Like Post').click();

        // Set duration to 1h (max 1 winner)
        cy.get('select').select('1h - $15');

        // Try to set winners cap to 5 (should be limited to 1)
        cy.get('input[type="number"]').clear().type('5');

        // Verify the input is limited to max winners
        cy.get('input[type="number"]').should('have.value', '1');
        cy.contains('of 1 max');
    });

    it('should show correct pricing for different durations', () => {
        // Select platform
        cy.contains('Twitter').click();

        // Select mission type
        cy.contains('Engage').click();

        // Select degen model
        cy.contains('Degen').click();

        // Select tasks
        cy.contains('Like Post').click();

        // Test different durations
        const testCases = [
            { duration: '1h - $15', expectedCost: '$15.00' },
            { duration: '3h - $30', expectedCost: '$30.00' },
            { duration: '6h - $80', expectedCost: '$80.00' },
            { duration: '24h - $400', expectedCost: '$400.00' },
        ];

        testCases.forEach(({ duration, expectedCost }) => {
            cy.get('select').select(duration);
            cy.contains('Total Cost:').should('contain', expectedCost);
        });
    });
});
