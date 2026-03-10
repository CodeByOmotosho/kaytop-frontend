// /**
//  * Customer Details Page
//  * Display comprehensive customer information including accounts, loans, and transactions
//  */

// 'use client';

// import { use, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import AccountCard from '@/app/_components/ui/AccountCard';
// import CustomerInfoCard from '@/app/_components/ui/CustomerInfoCard';
// import ActiveLoanCard from '@/app/_components/ui/ActiveLoanCard';
// import TransactionHistoryTable from '@/app/_components/ui/TransactionHistoryTable';
// import SavingsTransactionsTable from '@/app/_components/ui/SavingsTransactionsTable';
// import TransactionApprovalModal from '@/app/_components/ui/TransactionApprovalModal';
// import { userService } from '@/lib/services/users';
// import { loanService } from '@/lib/services/loans';
// import { formatDate } from '@/lib/utils';
// import { formatCustomerDate } from '@/lib/dateUtils';
// import { savingsService } from '@/lib/services/savings';
// import { useToast } from '@/app/hooks/useToast';
// import { ToastContainer } from '@/app/_components/ui/ToastContainer';
// import type { User, Loan, SavingsAccount, Transaction } from '@/lib/api/types';

// interface PageProps {
//   params: Promise<{ id: string }>;
// }

// interface CustomerDetails {
//   id: string;
//   name: string;
//   userId: string;
//   dateJoined: string;
//   email: string;
//   phoneNumber: string;
//   gender: string;
//   address: string;
//   loanRepayment: {
//     amount: number;
//     nextPayment: string;
//     growth: number;
//   };
//   savingsAccount: {
//     balance: number;
//     growth: number;
//     chartData: number[];
//   };
//   activeLoan: {
//     loanId: string;
//     amount: number;
//     outstanding: number;
//     monthlyPayment: number;
//     interestRate: number;
//     startDate: string;
//     endDate: string;
//     paymentSchedule: Array<{
//       id: string;
//       paymentNumber: number;
//       amount: number;
//       status: 'Paid' | 'Missed' | 'Upcoming';
//       dueDate: Date;
//       isPaid: boolean;
//     }>;
//   };
//   transactions: Array<{
//     id: string;
//     transactionId: string;
//     type: 'Repayment' | 'Savings';
//     amount: number;
//     status: 'Successful' | 'Pending' | 'In Progress';
//     date: string;
//   }>;
// }

// export default function CustomerDetailsPage({ params }: PageProps) {
//   const { id } = use(params);
//   const router = useRouter();
//   const { toasts, removeToast, error } = useToast();

//   // API data state
//   const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
//   const [savingsAccount, setSavingsAccount] = useState<SavingsAccount | null>(null);
//   const [savingsAccountStatus, setSavingsAccountStatus] = useState<'no-account' | 'empty-account' | 'has-balance'>('no-account');
//   const [isLoading, setIsLoading] = useState(true);
//   const [apiError, setApiError] = useState<string | null>(null);

//   // Modal states
//   const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
//   const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

//   // Transform API data to CustomerDetails format
//   const transformApiDataToCustomerDetails = (
//     user: User,
//     loans: Loan[],
//     savings: SavingsAccount | null
//   ): CustomerDetails => {
//     const activeLoan = loans.find(loan => loan.status === 'active') || loans[0];

//     return {
//       id: String(user.id), // Ensure ID is string
//       name: `${user.firstName} ${user.lastName}`,
//       userId: String(user.id).slice(-8).toUpperCase(),
//       dateJoined: formatCustomerDate(user.createdAt),
//       email: user.email,
//       phoneNumber: user.mobileNumber,
//       gender: 'Not specified', // This field might not be available in the API
//       address: 'Not specified', // This field might not be available in the API
//       loanRepayment: {
//         amount: activeLoan ? activeLoan.amount * 0.1 : 0, // Assuming 10% monthly payment
//         nextPayment: activeLoan?.nextRepaymentDate ?
//           formatDate(activeLoan.nextRepaymentDate) || 'N/A' : 'N/A',
//         growth: 5 // Placeholder
//       },
//       savingsAccount: {
//         balance: savings?.balance || 0,
//         growth: 12, // Placeholder
//         chartData: [25, 30, 20, 25] // Placeholder chart data
//       },
//       activeLoan: activeLoan ? {
//         loanId: String(activeLoan.id).slice(-8).toUpperCase(),
//         amount: activeLoan.amount,
//         outstanding: activeLoan.amount * 0.7, // Placeholder - 70% outstanding
//         monthlyPayment: activeLoan.amount * 0.1, // Placeholder - 10% monthly
//         interestRate: activeLoan.interestRate,
//         startDate: activeLoan.createdAt,
//         endDate: activeLoan.nextRepaymentDate || activeLoan.createdAt,
//         paymentSchedule: [] as Array<{
//           id: string;
//           paymentNumber: number;
//           amount: number;
//           status: 'Paid' | 'Missed' | 'Upcoming';
//           dueDate: Date;
//           isPaid: boolean;
//         }> // Would need separate API call for payment schedule
//       } : {
//         loanId: 'N/A',
//         amount: 0,
//         outstanding: 0,
//         monthlyPayment: 0,
//         interestRate: 0,
//         startDate: '',
//         endDate: '',
//         paymentSchedule: []
//       },
//       transactions: [
//         // Add savings transactions if available
//         ...(savings?.transactions?.map(transaction => ({
//           id: String(transaction.id), // Ensure ID is string
//           transactionId: String(transaction.id).slice(-8).toUpperCase(),
//           type: transaction.type === 'deposit' ? 'Savings' : 'Repayment',
//           amount: transaction.amount || 0,
//           status: transaction.status === 'approved' ? 'Successful' :
//             transaction.status === 'rejected' ? 'Pending' :
//             transaction.status === 'pending' ? 'In Progress' : 'Unknown',
//           date: new Date(transaction.createdAt).toLocaleDateString('en-US', {
//             month: 'short',
//             day: 'numeric',
//             year: 'numeric'
//           })
//         })) || []),
//         // TODO: Add loan repayment transactions when available from API
//         // This would require a separate API call to get loan repayment history
//       ]
//     };
//   };

//   // Fetch customer details from API
//   const fetchCustomerDetails = async () => {
//     try {
//       setIsLoading(true);
//       setApiError(null);

//       // Fetch user details
//       const user = await userService.getUserById(id);

//       // Check if user is a customer (based on actual backend roles)
//       const isCustomer = user.role === 'user' ||
//                         user.role === 'customer' ||
//                         user.role === 'client';

//       if (!isCustomer) {
//         throw new Error(`User is not a customer. Found role: "${user.role}". Expected role: "user", "customer", or "client". This user appears to be a ${user.role.replace('_', ' ')}.`);
//       }

//       // Fetch customer loans using unified approach
//       let loans: Loan[] = [];
//       try {
//         // Try the unified loan service first (more reliable)
//         const { unifiedLoanService } = await import('@/lib/services/unifiedLoan');
//         const loansResponse = await unifiedLoanService.getCustomerLoans(id);

//         if (loansResponse.data && Array.isArray(loansResponse.data)) {
//           loans = loansResponse.data;
//         }
//       } catch (err) {
//         console.warn('Unified loan service failed, trying direct endpoint:', err);

//         // Fallback to direct endpoint
//         try {
//           loans = await loanService.getCustomerLoans(id);
//         } catch (directErr) {
//           console.warn('Direct loan endpoint also failed:', directErr);
//           // Continue without loan data - this is normal for customers without loans
//         }
//       }

//       // Fetch customer savings using unified approach
//       let savings: SavingsAccount | null = null;
//       let accountStatus: 'no-account' | 'empty-account' | 'has-balance' = 'no-account';

//       try {
//         // Try the unified savings service first (more reliable)
//         const { unifiedSavingsService } = await import('@/lib/services/unifiedSavings');
//         const savingsResponse = await unifiedSavingsService.getSavingsAccounts({
//           customerId: id,
//           limit: 1
//         });

//         if (savingsResponse.data && savingsResponse.data.length > 0) {
//           savings = savingsResponse.data[0];
//           // Customer has a savings account
//           accountStatus = savings.balance > 0 ? 'has-balance' : 'empty-account';
//         }
//       } catch (err) {
//         console.warn(`Unified savings service failed for customer ${id}:`, err);

//         // Fallback to direct endpoint
//         try {
//           savings = await savingsService.getCustomerSavings(id);
//           // If we get here, customer has an account (even if balance is 0)
//           accountStatus = savings.balance > 0 ? 'has-balance' : 'empty-account';
//         } catch (directErr) {
//           console.warn(`Direct savings endpoint also failed for customer ${id}:`, directErr);
//           // Check if it's a 404 (no account) vs other error
//           if (directErr && typeof directErr === 'object' && 'response' in directErr) {
//             const axiosError = directErr as { response?: { status?: number } };
//             if (axiosError.response?.status === 404) {
//               accountStatus = 'no-account';
//               console.info(`Customer ${id} does not have a savings account (404)`);
//             }
//           }
//           // Continue without savings data - this is normal for customers without savings accounts
//         }
//       }

//       setSavingsAccountStatus(accountStatus);

//       const details = transformApiDataToCustomerDetails(user, loans, savings);
//       setCustomerDetails(details);
//       setSavingsAccount(savings);

//     } catch (err) {
//       console.error('Failed to fetch customer details:', err);
//       setApiError(err instanceof Error ? err.message : 'Failed to load customer details');
//       error('Failed to load customer details. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle savings operations success
//   const handleSavingsOperationSuccess = () => {
//     // Refresh customer details to show updated data
//     fetchCustomerDetails();
//   };

//   // Handle transaction approval
//   const handleTransactionApproval = (transaction: Transaction) => {
//     setSelectedTransaction(transaction);
//     setIsApprovalModalOpen(true);
//   };

//   // Load initial data
//   useEffect(() => {
//     // Reset state when customer ID changes
//     setCustomerDetails(null);
//     setSavingsAccount(null);
//     setSavingsAccountStatus('no-account');
//     setApiError(null);

//     fetchCustomerDetails();
//   }, [id]);

//   // Show loading state
//   if (isLoading || !customerDetails) {
//     return (
//       <div className="drawer-content flex flex-col min-h-screen">
//         <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
//           <div className="w-full" style={{ maxWidth: '1200px' }}>
//             <div className="animate-pulse">
//               <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//               <div className="flex gap-6 mb-6">
//                 <div className="h-32 bg-gray-200 rounded w-1/2"></div>
//                 <div className="h-32 bg-gray-200 rounded w-1/2"></div>
//               </div>
//               <div className="h-24 bg-gray-200 rounded mb-6"></div>
//               <div className="h-32 bg-gray-200 rounded mb-8"></div>
//               <div className="h-64 bg-gray-200 rounded"></div>
//             </div>
//           </div>
//         </main>
//         <ToastContainer toasts={toasts} onClose={removeToast} />
//       </div>
//     );
//   }

//   // Calculate loan repayment percentage for donut chart
//   const loanAmount = customerDetails.activeLoan.amount;
//   const loanOutstanding = customerDetails.activeLoan.outstanding;
//   const loanPaid = loanAmount - loanOutstanding;

//   // Handle cases where customer has no loans or invalid loan data
//   const hasValidLoan = loanAmount > 0;
//   const loanPercentage = hasValidLoan ? (loanPaid / loanAmount) * 100 : 0;

//   // Prepare chart data - show empty chart for customers without loans
//   const loanChartData = hasValidLoan ? [
//     { value: loanPaid, color: '#7F56D9' },
//     { value: loanOutstanding, color: '#F4EBFF' }
//   ] : [];

//   // Prepare pie chart data for savings account
//   const savingsChartData = customerDetails.savingsAccount.chartData.map((value, index) => {
//     const colors = ['#475467', '#667085', '#98A2B3', '#D0D5DD'];
//     return {
//       value,
//       color: colors[index] || '#D0D5DD'
//     };
//   });

//   // Format currency
//   const formatCurrency = (value: number) => {
//     return `₦${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   };

//   // Get savings account subtitle based on status
//   const getSavingsSubtitle = () => {
//     switch (savingsAccountStatus) {
//       case 'no-account':
//         return 'No savings account opened';
//       case 'empty-account':
//         return 'Account opened - Zero balance';
//       case 'has-balance':
//         return 'Current balance';
//       default:
//         return 'Current balance';
//     }
//   };

//   // Get savings account amount display
//   const getSavingsAmount = () => {
//     if (savingsAccountStatus === 'no-account') {
//       return 'No Account';
//     }
//     return formatCurrency(customerDetails.savingsAccount.balance);
//   };

//   // Get loan repayment subtitle based on loan status
//   const getLoanSubtitle = () => {
//     if (!hasValidLoan) {
//       return 'No active loans';
//     }
//     return `Next Payment - ${customerDetails.loanRepayment.nextPayment}`;
//   };

//   // Get loan repayment amount display
//   const getLoanAmount = () => {
//     if (!hasValidLoan) {
//       return 'No Loan';
//     }
//     return formatCurrency(customerDetails.loanRepayment.amount);
//   };

//   return (
//     <div className="drawer-content flex flex-col min-h-screen" key={id}>
//       <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
//         {/* Container with proper max width */}
//         <div className="w-full" style={{ maxWidth: '1200px' }}>
//           {/* Back Button and Header */}
//           <div className="mb-6">
//             <button
//               onClick={() => router.push('/dashboard/hq/customers')}
//               className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
//               aria-label="Go back to customers list"
//             >
//               <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
//                 <path
//                   d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
//                   stroke="#000000"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </button>

//             <h1
//               className="text-2xl font-bold"
//               style={{ color: '#021C3E', fontSize: '24px' }}
//             >
//               Customer Details
//             </h1>
//           </div>

//           {/* Account Cards */}
//           <div className="flex gap-6 mb-6">
//             <AccountCard
//               title="Loan Repayment"
//               subtitle={getLoanSubtitle()}
//               amount={getLoanAmount()}
//               growth={hasValidLoan ? customerDetails.loanRepayment.growth : 0}
//               chartData={loanChartData}
//               chartType="loan"
//               percentage={loanPercentage}
//             />
//             <AccountCard
//               title="Savings Account"
//               subtitle={getSavingsSubtitle()}
//               amount={getSavingsAmount()}
//               growth={savingsAccountStatus === 'no-account' ? 0 : customerDetails.savingsAccount.growth}
//               chartData={savingsAccountStatus === 'no-account' ? [] : savingsChartData}
//               chartType="savings"
//             />
//           </div>

//           {/* Customer Information Card */}
//           <div className="mb-6">
//             <CustomerInfoCard
//               customerName={customerDetails.name}
//               userId={customerDetails.userId}
//               dateJoined={customerDetails.dateJoined}
//               email={customerDetails.email}
//               phoneNumber={customerDetails.phoneNumber}
//               gender={customerDetails.gender}
//               address={customerDetails.address}
//             />
//           </div>

//           {/* Active Loan Card */}
//           <div className="mb-8">
//             <ActiveLoanCard
//               loanId={customerDetails.activeLoan.loanId}
//               amount={customerDetails.activeLoan.amount}
//               outstanding={customerDetails.activeLoan.outstanding}
//               monthlyPayment={customerDetails.activeLoan.monthlyPayment}
//               interestRate={customerDetails.activeLoan.interestRate}
//               startDate={customerDetails.activeLoan.startDate}
//               endDate={customerDetails.activeLoan.endDate}
//               paymentSchedule={customerDetails.activeLoan.paymentSchedule}
//             />
//           </div>

//           {/* Savings Transactions Table */}
//           {savingsAccount && savingsAccount.transactions && savingsAccount.transactions.length > 0 && (
//             <div className="mb-8">
//               <SavingsTransactionsTable
//                 transactions={savingsAccount.transactions}
//                 onApproveTransaction={handleTransactionApproval}
//               />
//             </div>
//           )}

//           {/* Transaction History Table */}
//           <div>
//             <TransactionHistoryTable
//               transactions={customerDetails.transactions}
//               onTransactionAction={handleTransactionApproval}
//             />
//           </div>
//         </div>
//       </main >

//       {/* Savings Modals */}
//       <TransactionApprovalModal
//         isOpen={isApprovalModalOpen}
//         onClose={() => setIsApprovalModalOpen(false)}
//         transaction={selectedTransaction}
//         onSuccess={handleSavingsOperationSuccess}
//       />

//       {/* Toast Container */}
//       <ToastContainer toasts={toasts} onClose={removeToast} />
//     </div >
//   );
// }

"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AccountCard from "@/app/_components/ui/AccountCard";
import CustomerInfoCard from "@/app/_components/ui/CustomerInfoCard";
import ActiveLoanCard from "@/app/_components/ui/ActiveLoanCard";
import TransactionHistoryTable from "@/app/_components/ui/TransactionHistoryTable";
import SavingsTransactionsTable from "@/app/_components/ui/SavingsTransactionsTable";
import TransactionApprovalModal from "@/app/_components/ui/TransactionApprovalModal";
import {
    hqManagerService,
    CustomerDetails,
    CustomerLoan,
    CustomerSavings,
} from "@/lib/services/hq-manager.service";
import { formatDate } from "@/lib/utils";
import { formatCustomerDate } from "@/lib/dateUtils";
import { useToast } from "@/app/hooks/useToast";
import { ToastContainer } from "@/app/_components/ui/ToastContainer";
import type { Transaction } from "@/lib/api/types";

interface PageProps {
    params: Promise<{ id: string }>;
}

interface CustomerDisplayDetails {
    id: string;
    name: string;
    userId: string;
    dateJoined: string;
    email: string;
    phoneNumber: string;
    gender: string;
    address: string;
    branch: string;
    verificationStatus: string;
    profilePicture?: string | null;
    guarantorInfo?: {
        name: string | null;
        email: string | null;
        phone: string | null;
        address: string | null;
        picture: string | null;
    };
    loanRepayment: {
        amount: number;
        nextPayment: string;
        growth: number;
    };
    savingsAccount: {
        balance: number;
        growth: number;
        chartData: number[];
        accountId?: number;
        targetAmount?: number | null;
        targetDescription?: string | null;
    };
    activeLoan: {
        loanId: string;
        amount: number;
        outstanding: number;
        monthlyPayment: number;
        interestRate: number;
        startDate: string;
        endDate: string;
        dailyRepayment: number;
        totalRepayable: number;
        amountPaid: number;
        daysOverdue: number;
        status: string;
        paymentSchedule: Array<{
            id: string;
            paymentNumber: number;
            amount: number;
            status: "Paid" | "Missed" | "Upcoming";
            dueDate: Date;
            isPaid: boolean;
        }>;
    };
    transactions: Array<{
        id: string;
        transactionId: string;
        type: "Repayment" | "Savings";
        amount: number;
        status: "Successful" | "Pending" | "In Progress";
        date: string;
    }>;
}

export default function CustomerDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { toasts, removeToast, error, success } = useToast();

    // API data state
    const [customerDetails, setCustomerDetails] =
        useState<CustomerDisplayDetails | null>(null);
    const [rawCustomer, setRawCustomer] = useState<CustomerDetails | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);

    // Modal states
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);

    // Transform API data to CustomerDisplayDetails format
    const transformApiDataToDisplayDetails = (
        customer: CustomerDetails,
    ): CustomerDisplayDetails => {
        const activeLoan =
            customer.loans && customer.loans.length > 0
                ? customer.loans[0]
                : null;
        const primarySavings =
            customer.savings && customer.savings.length > 0
                ? customer.savings[0]
                : null;

        // Parse string amounts to numbers
        const loanAmount = activeLoan ? parseFloat(activeLoan.amount) : 0;
        const totalRepayable = activeLoan
            ? parseFloat(activeLoan.totalRepayable)
            : 0;
        const amountPaid = activeLoan ? parseFloat(activeLoan.amountPaid) : 0;
        const remainingBalance = activeLoan
            ? parseFloat(activeLoan.remainingBalance)
            : 0;
        const dailyRepayment = activeLoan
            ? parseFloat(activeLoan.dailyRepayment)
            : 0;
        const interestRate = activeLoan
            ? parseFloat(activeLoan.interestRate)
            : 0;

        // Calculate monthly payment (approx - 30 days)
        const monthlyPayment = dailyRepayment * 30;

        return {
            id: String(customer.id),
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            userId: String(customer.id).slice(-8).toUpperCase(),
            dateJoined: formatCustomerDate(customer.createdAt),
            email: customer.email,
            phoneNumber: customer.mobileNumber,
            gender: "Not specified", // Still not in API
            address: customer.address || "Not specified",
            branch: customer.branch,
            verificationStatus: customer.verificationStatus,
            profilePicture: customer.profilePicture,
            guarantorInfo: {
                name: customer.guarantorName,
                email: customer.guarantorEmail,
                phone: customer.guarantorPhone,
                address: customer.guarantorAddress,
                picture: customer.guarantorPicture,
            },
            loanRepayment: {
                amount: monthlyPayment,
                nextPayment: activeLoan?.dueDate
                    ? formatDate(activeLoan.dueDate)
                    : "N/A",
                growth: 0, // Would need historical data
            },
            savingsAccount: {
                balance: primarySavings
                    ? parseFloat(primarySavings.balance)
                    : 0,
                growth: 0, // Would need historical data
                chartData: [25, 30, 20, 25], // Placeholder chart data
                accountId: primarySavings?.id,
                targetAmount: primarySavings?.targetAmount
                    ? parseFloat(primarySavings.targetAmount)
                    : null,
                targetDescription: primarySavings?.targetDescription,
            },
            activeLoan: activeLoan
                ? {
                      loanId: String(activeLoan.id).slice(-8).toUpperCase(),
                      amount: loanAmount,
                      outstanding: remainingBalance,
                      monthlyPayment: monthlyPayment,
                      dailyRepayment: dailyRepayment,
                      interestRate: interestRate,
                      startDate:
                          activeLoan.disbursementDate || activeLoan.createdAt,
                      endDate: activeLoan.dueDate || activeLoan.createdAt,
                      totalRepayable: totalRepayable,
                      amountPaid: amountPaid,
                      daysOverdue: activeLoan.daysOverdue,
                      status: activeLoan.status,
                      paymentSchedule: [], // Would need separate API call for detailed schedule
                  }
                : {
                      loanId: "N/A",
                      amount: 0,
                      outstanding: 0,
                      monthlyPayment: 0,
                      dailyRepayment: 0,
                      interestRate: 0,
                      startDate: "",
                      endDate: "",
                      totalRepayable: 0,
                      amountPaid: 0,
                      daysOverdue: 0,
                      status: "",
                      paymentSchedule: [],
                  },
            transactions: [], // Would need transaction history API
        };
    };

    // Fetch customer details from HQ Manager API
    const fetchCustomerDetails = async () => {
        try {
            setIsLoading(true);
            setApiError(null);

            console.log(
                `Fetching customer details for ID: ${id} using HQ Manager Service...`,
            );

            // Get customer by ID from HQ Manager API
            const customer = await hqManagerService.getCustomerById(
                parseInt(id),
            );
            console.log("Customer data received:", customer);

            setRawCustomer(customer);

            const details = transformApiDataToDisplayDetails(customer);
            setCustomerDetails(details);
        } catch (err) {
            console.error("Failed to fetch customer details:", err);
            setApiError(
                err instanceof Error
                    ? err.message
                    : "Failed to load customer details",
            );
            error("Failed to load customer details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle savings operations success
    const handleSavingsOperationSuccess = () => {
        // Refresh customer details to show updated data
        fetchCustomerDetails();
        success("Operation completed successfully!");
    };

    // Handle transaction approval
    const handleTransactionApproval = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsApprovalModalOpen(true);
    };

    // Load initial data
    useEffect(() => {
        // Reset state when customer ID changes
        setCustomerDetails(null);
        setRawCustomer(null);
        setApiError(null);

        fetchCustomerDetails();
    }, [id]);

    // Show loading state
    if (isLoading || !customerDetails) {
        return (
            <div className="drawer-content flex flex-col min-h-screen">
                <main
                    className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                    style={{ paddingTop: "40px" }}
                >
                    <div className="w-full" style={{ maxWidth: "1200px" }}>
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                            <div className="flex gap-6 mb-6">
                                <div className="h-32 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-32 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-48 bg-gray-200 rounded mb-6"></div>
                            <div className="h-64 bg-gray-200 rounded mb-8"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </main>
                <ToastContainer toasts={toasts} onClose={removeToast} />
            </div>
        );
    }

    // Calculate loan repayment percentage for donut chart
    const hasValidLoan = customerDetails.activeLoan.amount > 0;
    const loanPaid = customerDetails.activeLoan.amountPaid;
    const loanOutstanding = customerDetails.activeLoan.outstanding;
    const loanPercentage = hasValidLoan
        ? (loanPaid / customerDetails.activeLoan.totalRepayable) * 100
        : 0;

    // Prepare chart data
    const loanChartData = hasValidLoan
        ? [
              { value: loanPaid, color: "#7F56D9" },
              { value: loanOutstanding, color: "#F4EBFF" },
          ]
        : [];

    // Prepare pie chart data for savings account
    const savingsChartData = customerDetails.savingsAccount.chartData.map(
        (value, index) => {
            const colors = ["#475467", "#667085", "#98A2B3", "#D0D5DD"];
            return {
                value,
                color: colors[index] || "#D0D5DD",
            };
        },
    );

    // Format currency
    const formatCurrency = (value: number) => {
        return `₦${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Get savings account subtitle
    const getSavingsSubtitle = () => {
        if (customerDetails.savingsAccount.balance === 0) {
            return "Zero balance";
        }
        if (customerDetails.savingsAccount.targetAmount) {
            return `Target: ${formatCurrency(customerDetails.savingsAccount.targetAmount)}`;
        }
        return "Current balance";
    };

    // Get loan repayment subtitle
    const getLoanSubtitle = () => {
        if (!hasValidLoan) {
            return "No active loans";
        }
        if (customerDetails.activeLoan.daysOverdue > 0) {
            return `${customerDetails.activeLoan.daysOverdue} days overdue - Next: ${customerDetails.loanRepayment.nextPayment}`;
        }
        return `Next Payment - ${customerDetails.loanRepayment.nextPayment}`;
    };

    return (
        <div className="drawer-content flex flex-col min-h-screen" key={id}>
            <main
                className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6"
                style={{ paddingTop: "40px" }}
            >
                {/* Container with proper max width */}
                <div className="w-full" style={{ maxWidth: "1200px" }}>
                    {/* Back Button and Header */}
                    <div className="mb-6">
                        <button
                            onClick={() =>
                                router.push("/dashboard/hq/customers")
                            }
                            className="mb-4 hover:opacity-70 transition-opacity flex items-center gap-2"
                            aria-label="Go back to customers list"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <path
                                    d="M15.8334 10H4.16669M4.16669 10L10 15.8333M4.16669 10L10 4.16667"
                                    stroke="#000000"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="text-sm text-gray-600">
                                Back to Customers
                            </span>
                        </button>

                        <div className="flex items-center justify-between">
                            <h1
                                className="text-2xl font-bold"
                                style={{ color: "#021C3E", fontSize: "24px" }}
                            >
                                Customer Details
                            </h1>
                            <div className="flex items-center gap-3">
                                {rawCustomer?.verificationStatus && (
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            rawCustomer.verificationStatus ===
                                            "verified"
                                                ? "bg-green-50 text-green-700"
                                                : rawCustomer.verificationStatus ===
                                                    "pending"
                                                  ? "bg-yellow-50 text-yellow-700"
                                                  : "bg-red-50 text-red-700"
                                        }`}
                                    >
                                        {rawCustomer.verificationStatus
                                            .charAt(0)
                                            .toUpperCase() +
                                            rawCustomer.verificationStatus.slice(
                                                1,
                                            )}
                                    </span>
                                )}
                                {rawCustomer?.branch && (
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                        {rawCustomer.branch}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Cards */}
                    <div className="flex gap-6 mb-6">
                        <AccountCard
                            title="Loan Repayment"
                            subtitle={getLoanSubtitle()}
                            amount={
                                hasValidLoan
                                    ? formatCurrency(
                                          customerDetails.loanRepayment.amount,
                                      )
                                    : "No Loan"
                            }
                            growth={customerDetails.loanRepayment.growth}
                            chartData={loanChartData}
                            chartType="loan"
                            percentage={loanPercentage}
                        />
                        <AccountCard
                            title="Savings Account"
                            subtitle={getSavingsSubtitle()}
                            amount={formatCurrency(
                                customerDetails.savingsAccount.balance,
                            )}
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
                            verificationStatus={rawCustomer?.verificationStatus}
                            branch={rawCustomer?.branch}
                            profilePicture={customerDetails.profilePicture}
                            guarantorInfo={customerDetails.guarantorInfo}
                        />
                    </div>

                    {/* Active Loan Card - Only show if customer has loans */}
                    {hasValidLoan && (
                        <div className="mb-8">
                            <ActiveLoanCard
                                loanId={customerDetails.activeLoan.loanId}
                                amount={customerDetails.activeLoan.amount}
                                outstanding={
                                    customerDetails.activeLoan.outstanding
                                }
                                monthlyPayment={
                                    customerDetails.activeLoan.monthlyPayment
                                }
                                interestRate={
                                    customerDetails.activeLoan.interestRate
                                }
                                startDate={customerDetails.activeLoan.startDate}
                                endDate={customerDetails.activeLoan.endDate}
                                paymentSchedule={
                                    customerDetails.activeLoan.paymentSchedule
                                }
                                dailyRepayment={
                                    customerDetails.activeLoan.dailyRepayment
                                }
                                totalRepayable={
                                    customerDetails.activeLoan.totalRepayable
                                }
                                amountPaid={
                                    customerDetails.activeLoan.amountPaid
                                }
                                daysOverdue={
                                    customerDetails.activeLoan.daysOverdue
                                }
                                status={customerDetails.activeLoan.status}
                            />
                        </div>
                    )}

                    {/* Savings Info Card - Only show if customer has savings */}
                    {rawCustomer?.savings && rawCustomer.savings.length > 0 && (
                        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">
                                Savings Account Details
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Account ID
                                    </p>
                                    <p className="font-medium">
                                        #
                                        {
                                            customerDetails.savingsAccount
                                                .accountId
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Balance
                                    </p>
                                    <p className="font-medium">
                                        {formatCurrency(
                                            customerDetails.savingsAccount
                                                .balance,
                                        )}
                                    </p>
                                </div>
                                {customerDetails.savingsAccount
                                    .targetAmount && (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Target Amount
                                            </p>
                                            <p className="font-medium">
                                                {formatCurrency(
                                                    customerDetails
                                                        .savingsAccount
                                                        .targetAmount,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Progress
                                            </p>
                                            <p className="font-medium">
                                                {(
                                                    (customerDetails
                                                        .savingsAccount
                                                        .balance /
                                                        customerDetails
                                                            .savingsAccount
                                                            .targetAmount) *
                                                    100
                                                ).toFixed(1)}
                                                %
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                            {customerDetails.savingsAccount
                                .targetDescription && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">
                                        Target Description
                                    </p>
                                    <p className="font-medium">
                                        {
                                            customerDetails.savingsAccount
                                                .targetDescription
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transaction History Table */}
                    <div>
                        <TransactionHistoryTable
                            transactions={customerDetails.transactions}
                            onTransactionAction={handleTransactionApproval}
                        />
                    </div>

                    {/* Note about missing data */}
                    {customerDetails.transactions.length === 0 &&
                        !hasValidLoan &&
                        rawCustomer?.savings.length === 0 && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    This customer has no loans, savings, or
                                    transactions yet. Additional details will
                                    appear here once available.
                                </p>
                            </div>
                        )}
                </div>
            </main>

            {/* Savings Modals */}
            <TransactionApprovalModal
                isOpen={isApprovalModalOpen}
                onClose={() => setIsApprovalModalOpen(false)}
                transaction={selectedTransaction}
                onSuccess={handleSavingsOperationSuccess}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onClose={removeToast} />
        </div>
    );
}
