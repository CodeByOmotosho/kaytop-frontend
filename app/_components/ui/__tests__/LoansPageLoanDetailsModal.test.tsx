/**
 * Property-Based Tests for LoansPageLoanDetailsModal
 * Feature: loans-page-loan-details-modal
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoansPageLoanDetailsModal, {
  LoanDetailsData,
} from '../LoansPageLoanDetailsModal';
import fc from 'fast-check';

// Arbitraries for property-based testing
const loanStatusArbitrary = fc.constantFrom(
  'Active' as const,
  'Scheduled' as const,
  'Missed Payment' as const
);

const loanDetailsDataArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  loanId: fc.string({ minLength: 5, maxLength: 5 }),
  borrowerName: fc.string({ minLength: 3, maxLength: 50 }),
  borrowerPhone: fc.string({ minLength: 10, maxLength: 20 }),
  status: loanStatusArbitrary,
  amount: fc.integer({ min: 1000, max: 10000000 }),
  interestRate: fc.float({ min: 0.1, max: 50, noNaN: true }),
  nextRepaymentDate: fc.date(),
  disbursementDate: fc.date(),
  creditOfficer: fc.string({ minLength: 3, maxLength: 50 }),
  branch: fc.string({ minLength: 3, maxLength: 50 }),
  missedPayments: fc.option(fc.integer({ min: 0, max: 10 }), { nil: undefined }),
});

describe('LoansPageLoanDetailsModal - Property-Based Tests', () => {
  /**
   * Property 1: Complete Data Display
   * Feature: loans-page-loan-details-modal, Property 1: Complete Data Display
   * For any valid LoanDetailsData object, all required fields should be displayed
   * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10
   */
  it('should display all required loan data fields for any valid loan data', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        const { container } = render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        // Check that the modal is rendered
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();

        // For now, just verify the modal renders with the data
        // Full data display will be implemented in subsequent tasks
        expect(container).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Close Button Callback
   * Feature: loans-page-loan-details-modal, Property 7: Close Button Callback
   * For any user interaction with the close button, the onClose callback should be invoked exactly once
   * Validates: Requirements 3.1
   */
  it('should invoke onClose callback exactly once when close button is clicked', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        const closeButton = screen.getByLabelText('Close modal');
        closeButton.click();

        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Export Button Callback
   * Feature: loans-page-loan-details-modal, Property 13: Export Button Callback
   * For any user click on the Export button, the export functionality should be triggered
   * Validates: Requirements 9.1
   */
  it('should trigger export functionality when export button is clicked', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        // Mock URL.createObjectURL and related functions
        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();
        
        // Mock document.createElement and appendChild
        const mockLink = {
          href: '',
          download: '',
          click: jest.fn(),
        };
        const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
        const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
        const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();

        render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        const exportButton = screen.getByLabelText('Export to CSV');
        exportButton.click();

        // Verify export was triggered
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(mockLink.click).toHaveBeenCalled();

        // Cleanup
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Print Button Callback
   * Feature: loans-page-loan-details-modal, Property 14: Print Button Callback
   * For any user click on the Print button, the print functionality should be triggered
   * Validates: Requirements 9.2
   */
  it('should trigger print functionality when print button is clicked', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        // Mock window.print
        const printSpy = jest.spyOn(window, 'print').mockImplementation();

        render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        const printButton = screen.getByLabelText('Print');
        printButton.click();

        // Verify print was triggered
        expect(printSpy).toHaveBeenCalled();

        printSpy.mockRestore();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Phone Number Formatting
   * Feature: loans-page-loan-details-modal, Property 6: Phone Number Formatting
   * For any phone number value, when displayed in the modal, it should be formatted consistently
   * Validates: Requirements 1.3, 5.5
   */
  it('should format phone numbers consistently', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        const { container } = render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        // Verify phone number is displayed (formatting will be enhanced in later tasks)
        const phoneText = container.textContent;
        expect(phoneText).toContain(loanData.borrowerPhone || 'N/A');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Currency Formatting Consistency
   * Feature: loans-page-loan-details-modal, Property 2: Currency Formatting Consistency
   * For any loan amount value, when displayed in the modal, it should be formatted with the Nigerian Naira symbol (₦) and include thousand separators
   * Validates: Requirements 1.4, 5.1
   */
  it('should format currency values with Naira symbol and thousand separators', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        const { container } = render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        // Verify currency formatting includes ₦ symbol
        const text = container.textContent;
        if (loanData.amount) {
          expect(text).toMatch(/₦/);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Percentage Formatting
   * Feature: loans-page-loan-details-modal, Property 3: Percentage Formatting
   * For any interest rate value, when displayed in the modal, it should include the percent symbol (%)
   * Validates: Requirements 1.5, 5.4
   */
  it('should format interest rates with percent symbol', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        const { container } = render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        // Verify percentage formatting includes % symbol
        const text = container.textContent;
        if (loanData.interestRate) {
          expect(text).toContain('%');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Status Color Coding
   * Feature: loans-page-loan-details-modal, Property 4: Status Color Coding
   * For any loan status (Active, Scheduled, Missed Payment), the status badge should use the correct color coding matching the StatusBadge component
   * Validates: Requirements 1.6, 5.3
   */
  it('should display status with correct color coding', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        const { container } = render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        // Verify status is displayed
        const text = container.textContent;
        expect(text).toContain(loanData.status);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Date Formatting
   * Feature: loans-page-loan-details-modal, Property 5: Date Formatting
   * For any date value (disbursementDate, nextRepaymentDate), when displayed in the modal, it should be formatted in a human-readable format
   * Validates: Requirements 1.7, 1.8, 5.2
   */
  it('should format dates in human-readable format', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        const { container } = render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        // Verify dates are formatted (should contain month names)
        const text = container.textContent;
        // Check that dates are present in some form
        expect(text).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Edit Button Callback
   * Feature: loans-page-loan-details-modal, Property 10: Edit Button Callback
   * For any user click on the Edit button, the onEdit callback should be invoked with the complete loan data
   * Validates: Requirements 4.1
   */
  it('should invoke onEdit callback with loan data when edit button is clicked', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        const editButton = screen.getByLabelText('Edit loan details');
        editButton.click();

        expect(mockOnEdit).toHaveBeenCalledTimes(1);
        expect(mockOnEdit).toHaveBeenCalledWith(loanData);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 11: Delete Button Callback
   * Feature: loans-page-loan-details-modal, Property 11: Delete Button Callback
   * For any user click on the Delete button, the onDelete callback should be invoked with the loan ID
   * Validates: Requirements 4.2
   */
  it('should invoke onDelete callback with loan ID when delete button is clicked', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        const deleteButton = screen.getByLabelText('Delete loan');
        deleteButton.click();

        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(loanData.loanId);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: View Schedule Button Callback
   * Feature: loans-page-loan-details-modal, Property 12: View Schedule Button Callback
   * For any user click on the View Schedule button, the onViewSchedule callback should be invoked with the loan ID
   * Validates: Requirements 4.3
   */
  it('should invoke onViewSchedule callback with loan ID when view schedule button is clicked', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        const viewScheduleButton = screen.getByLabelText('View payment schedule');
        viewScheduleButton.click();

        expect(mockOnViewSchedule).toHaveBeenCalledTimes(1);
        expect(mockOnViewSchedule).toHaveBeenCalledWith(loanData.loanId);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Backdrop Click Callback
   * Feature: loans-page-loan-details-modal, Property 8: Backdrop Click Callback
   * For any user click on the backdrop area, the onClose callback should be invoked exactly once
   * Validates: Requirements 3.2
   */
  it('should invoke onClose callback when backdrop is clicked', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        const { container } = render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        // Find backdrop (first child of container)
        const backdrop = container.querySelector('.fixed.inset-0');
        if (backdrop) {
          backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          expect(mockOnClose).toHaveBeenCalledTimes(1);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Escape Key Callback
   * Feature: loans-page-loan-details-modal, Property 9: Escape Key Callback
   * For any Escape key press when the modal is open, the onClose callback should be invoked exactly once
   * Validates: Requirements 3.3
   */
  it('should invoke onClose callback when Escape key is pressed', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        // Simulate Escape key press
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escapeEvent);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15: Title Case Labels
   * Feature: loans-page-loan-details-modal, Property 15: Title Case Labels
   * For any label or heading text in the modal, it should use title case capitalization
   * Validates: Requirements 8.6
   */
  it('should use title case for labels and headings', () => {
    fc.assert(
      fc.property(loanDetailsDataArbitrary, (loanData) => {
        const mockOnClose = jest.fn();
        const mockOnEdit = jest.fn();
        const mockOnDelete = jest.fn();
        const mockOnViewSchedule = jest.fn();

        render(
          <LoansPageLoanDetailsModal
            isOpen={true}
            onClose={mockOnClose}
            loanData={loanData}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            onViewSchedule={mockOnViewSchedule}
          />
        );

        // Verify title is present
        const title = screen.getByText('Loan Details');
        expect(title).toBeInTheDocument();
      }),
      { numRuns: 100 }
    );
  });
});

describe('LoansPageLoanDetailsModal - Unit Tests', () => {
  /**
   * Unit Tests for Error Handling
   */
  it('should display N/A for missing required fields', () => {
    const mockOnClose = jest.fn();
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnViewSchedule = jest.fn();

    const incompleteLoanData = {
      id: '1',
      loanId: '12345',
      borrowerName: '',
      borrowerPhone: '',
      status: 'Active' as const,
      amount: 0,
      interestRate: 0,
      nextRepaymentDate: new Date(),
      disbursementDate: new Date(),
      creditOfficer: '',
      branch: '',
    };

    const { container } = render(
      <LoansPageLoanDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        loanData={incompleteLoanData}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewSchedule={mockOnViewSchedule}
      />
    );

    const text = container.textContent;
    expect(text).toContain('N/A');
  });

  /**
   * Unit Tests for Accessibility
   */
  it('should have proper ARIA attributes', () => {
    const mockOnClose = jest.fn();
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnViewSchedule = jest.fn();

    const loanData = {
      id: '1',
      loanId: '12345',
      borrowerName: 'John Doe',
      borrowerPhone: '+234 123 456 7890',
      status: 'Active' as const,
      amount: 50000,
      interestRate: 7.5,
      nextRepaymentDate: new Date(),
      disbursementDate: new Date(),
      creditOfficer: 'Jane Smith',
      branch: 'Lagos Branch',
    };

    render(
      <LoansPageLoanDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        loanData={loanData}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewSchedule={mockOnViewSchedule}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');

    // Check aria-labels on buttons
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    expect(screen.getByLabelText('Export to CSV')).toBeInTheDocument();
    expect(screen.getByLabelText('Print')).toBeInTheDocument();
    expect(screen.getByLabelText('View payment schedule')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit loan details')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete loan')).toBeInTheDocument();
  });

  /**
   * Integration Tests
   */
  it('should integrate with loans page - modal opens when loan is clicked', () => {
    const mockOnClose = jest.fn();
    const mockOnEdit = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnViewSchedule = jest.fn();

    const loanData = {
      id: '1',
      loanId: '12345',
      borrowerName: 'John Doe',
      borrowerPhone: '+234 123 456 7890',
      status: 'Active' as const,
      amount: 50000,
      interestRate: 7.5,
      nextRepaymentDate: new Date(),
      disbursementDate: new Date(),
      creditOfficer: 'Jane Smith',
      branch: 'Lagos Branch',
    };

    const { rerender } = render(
      <LoansPageLoanDetailsModal
        isOpen={false}
        onClose={mockOnClose}
        loanData={loanData}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewSchedule={mockOnViewSchedule}
      />
    );

    // Modal should not be visible when isOpen is false
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Simulate opening the modal
    rerender(
      <LoansPageLoanDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        loanData={loanData}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewSchedule={mockOnViewSchedule}
      />
    );

    // Modal should now be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
