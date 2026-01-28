/**
 * ActiveLoanCard Component
 * Display active loan information with progress bar
 */

'use client';

import { useState } from 'react';
import ProgressBar from './ProgressBar';
import PaymentScheduleModal, { Payment } from './PaymentScheduleModal';

interface ActiveLoanCardProps {
  loanId: string;
  amount: number;
  outstanding: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  paymentSchedule?: Payment[]; // Optional payment schedule data
}

export default function ActiveLoanCard({
  loanId,
  amount,
  outstanding,
  monthlyPayment,
  interestRate,
  startDate,
  endDate,
  paymentSchedule = []
}: ActiveLoanCardProps) {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if this is a valid loan (customer has an active loan)
  const hasValidLoan = amount > 0 && loanId !== 'N/A';

  // Calculate progress percentage - handle division by zero
  const progressPercentage = hasValidLoan && amount > 0 ? ((amount - outstanding) / amount) * 100 : 0;

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // If customer has no loans, show empty state
  if (!hasValidLoan) {
    return (
      <div
        className="rounded-xl"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #EAECF0',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '1126px'
        }}
      >
        {/* Title */}
        <h3
          className="text-lg font-semibold mb-6"
          style={{ color: '#101828' }}
        >
          Active Loan
        </h3>

        {/* No Loan State */}
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-[#101828] mb-2">No Active Loans</h4>
          <p className="text-sm text-[#667085]">This customer currently has no active loans</p>
        </div>
      </div>
    );
  }

  const loanFields = [
    { label: 'Loan ID', value: loanId },
    { label: 'Amount', value: formatCurrency(amount) },
    { label: 'Outstanding', value: formatCurrency(outstanding) },
    { label: 'Monthly Payment', value: formatCurrency(monthlyPayment) },
    { label: 'Interest Rate', value: `${interestRate.toFixed(1)}%` },
    { label: 'Start Date', value: startDate },
    { label: 'End Date', value: endDate }
  ];

  return (
    <div
      className="rounded-xl"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #EAECF0',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '1126px'
      }}
    >
      {/* Title */}
      <h3
        className="text-lg font-semibold mb-6"
        style={{ color: '#101828' }}
      >
        Active Loan
      </h3>

      {/* Loan Fields */}
      <div className="grid grid-cols-4 gap-x-12 gap-y-6 mb-8">
        {loanFields.map((field, index) => (
          <div key={index}>
            <p
              className="text-sm font-normal mb-1"
              style={{ color: '#7C8FAC' }}
            >
              {field.label}
            </p>
            <p
              className="text-base font-normal"
              style={{ color: '#1E3146' }}
            >
              {field.value}
            </p>
          </div>
        ))}
      </div>

      {/* Repayment Progress */}
      <div className="mb-6">
        <ProgressBar
          percentage={progressPercentage}
          label="Repayment Progress"
          showPercentage={true}
        />
      </div>

      {/* View Payment Schedule Link */}
      <a
        href="#"
        className="inline-block text-sm font-semibold underline"
        style={{ color: '#6941C6' }}
        onClick={(e) => {
          e.preventDefault();
          setIsModalOpen(true);
        }}
      >
        View Payment Schedule
      </a>

      {/* Payment Schedule Modal */}
      <PaymentScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payments={paymentSchedule}
        loanId={loanId}
      />
    </div>
  );
}
