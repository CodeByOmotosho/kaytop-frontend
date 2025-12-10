/**
 * Customer Details Page
 * Display comprehensive customer information including accounts, loans, and transactions
 */

'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import AccountCard from '@/app/_components/ui/AccountCard';
import CustomerInfoCard from '@/app/_components/ui/CustomerInfoCard';
import ActiveLoanCard from '@/app/_components/ui/ActiveLoanCard';
import TransactionHistoryTable from '@/app/_components/ui/TransactionHistoryTable';
import { generateCustomerDetails } from '@/lib/customerDetailsDataGenerator';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Generate customer details
  const customerDetails = generateCustomerDetails(id);

  // Calculate loan repayment percentage for donut chart
  const loanAmount = customerDetails.activeLoan.amount;
  const loanOutstanding = customerDetails.activeLoan.outstanding;
  const loanPaid = loanAmount - loanOutstanding;
  const loanPercentage = (loanPaid / loanAmount) * 100;
  
  // Prepare chart data (kept for backwards compatibility)
  const loanChartData = [
    { value: loanPaid, color: '#7F56D9' },
    { value: loanOutstanding, color: '#F4EBFF' }
  ];

  // Prepare pie chart data for savings account
  const savingsChartData = customerDetails.savingsAccount.chartData.map((value, index) => {
    const colors = ['#475467', '#667085', '#98A2B3', '#D0D5DD'];
    return {
      value,
      color: colors[index] || '#D0D5DD'
    };
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="drawer-content flex flex-col min-h-screen">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        {/* Container with proper max width */}
        <div className="w-full" style={{ maxWidth: '1200px' }}>
          {/* Back Button and Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/dashboard/system-admin/customers')}
              className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
              aria-label="Go back to customers list"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h1
              className="text-2xl font-bold"
              style={{ color: '#021C3E', fontSize: '24px' }}
            >
              Customer Details
            </h1>
          </div>

          {/* Account Cards */}
          <div className="flex gap-6 mb-6">
            <AccountCard
              title="Loan Repayment"
              subtitle={`Next Payment - ${customerDetails.loanRepayment.nextPayment}`}
              amount={formatCurrency(customerDetails.loanRepayment.amount)}
              growth={customerDetails.loanRepayment.growth}
              chartData={loanChartData}
              chartType="loan"
              percentage={loanPercentage}
            />
            <AccountCard
              title="Savings Account"
              subtitle="Current balance"
              amount={formatCurrency(customerDetails.savingsAccount.balance)}
              growth={customerDetails.savingsAccount.growth}
              chartData={savingsChartData}
              chartType="savings"
            />
          </div>

          {/* Customer Information Card */}
          <div className="mb-6">
            <CustomerInfoCard
              customerName={customerDetails.name}
              userId={customerDetails.userId}
              dateJoined={customerDetails.dateJoined}
              email={customerDetails.email}
              phoneNumber={customerDetails.phoneNumber}
              gender={customerDetails.gender}
              address={customerDetails.address}
            />
          </div>

          {/* Active Loan Card */}
          <div className="mb-8">
            <ActiveLoanCard
              loanId={customerDetails.activeLoan.loanId}
              amount={customerDetails.activeLoan.amount}
              outstanding={customerDetails.activeLoan.outstanding}
              monthlyPayment={customerDetails.activeLoan.monthlyPayment}
              interestRate={customerDetails.activeLoan.interestRate}
              startDate={customerDetails.activeLoan.startDate}
              endDate={customerDetails.activeLoan.endDate}
              paymentSchedule={customerDetails.activeLoan.paymentSchedule}
            />
          </div>

          {/* Transaction History Table */}
          <div>
            <TransactionHistoryTable transactions={customerDetails.transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
