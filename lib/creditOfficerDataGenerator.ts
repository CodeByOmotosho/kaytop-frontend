/**
 * Credit Officer Data Generator
 * 
 * Generates consistent, unique data for credit officers based on their ID.
 * Uses a hash function to ensure the same ID always produces the same data.
 */

export interface CreditOfficerDetails {
  id: string;
  name: string;
  coId: string;
  dateJoined: string;
  email: string;
  phone: string;
  gender: string;
}

// Predefined data arrays for generation
const NAMES = [
  'Mike Salam',
  'Ademola Jumoke',
  'Adegboyega Precious',
  'Nneka Chukwu',
  'Damilare Usman',
  'Jide Kosoko',
  'Oladeji Israel',
  'Eze Chinedu',
  'Baba Kaothat',
  'Adebayo Salami'
];

const GENDERS = ['Male', 'Female'];

// Loan-related data arrays
const BORROWER_NAMES = [
  'Ademola Jumoke',
  'Adegboyoga Precious',
  'Nneka Chukwu',
  'Damilare Usman',
  'Jide Kosoko',
  'Oladeji Israel',
  'Eze Chinedu',
  'Adebanji Bolaji',
  'Baba Kaothat',
  'Adebayo Salami',
  'Chioma Okafor',
  'Emeka Nwosu',
  'Folake Adeyemi',
  'Gbenga Ogunleye',
  'Halima Bello',
  'Ibrahim Musa',
  'Joke Adebisi',
  'Kunle Ajayi',
  'Lateef Adewale',
  'Maryam Abdullahi',
  'Ngozi Eze',
  'Obinna Okeke',
  'Patricia Okonkwo',
  'Rasheed Lawal',
  'Sade Oladipo',
  'Tunde Bakare',
  'Uche Nnamdi',
  'Victoria Ojo',
  'Wasiu Ayinde',
  'Yetunde Akinola'
];

const LOAN_STATUSES = ['Active', 'Scheduled', 'Overdue', 'Completed'] as const;

export type LoanStatus = typeof LOAN_STATUSES[number];

export interface LoanRecord {
  id: string;
  loanId: string;
  borrowerName: string;
  status: LoanStatus;
  amount: number;
  interestRate: number;
  nextRepayment: string;
  creditOfficerId: string;
}

// Transaction-related types for Collections tab
const COLLECTION_STATUSES = ['Completed', 'Pending', 'Failed'] as const;
const COLLECTION_TYPES = ['Deposit', 'Withdrawal', 'Transfer'] as const;

export type CollectionStatus = typeof COLLECTION_STATUSES[number];
export type CollectionType = typeof COLLECTION_TYPES[number];

export interface CollectionTransaction {
  id: string;
  transactionId: string;
  type: CollectionType;
  amount: number;
  status: CollectionStatus;
  date: string;
  creditOfficerId: string;
}

// Loan disbursed types
const DISBURSED_LOAN_STATUSES = ['Active', 'Completed', 'Defaulted'] as const;

export type DisbursedLoanStatus = typeof DISBURSED_LOAN_STATUSES[number];

export interface DisbursedLoan {
  id: string;
  loanId: string;
  name: string;
  status: DisbursedLoanStatus;
  amount: number;
  interest: number;
  nextRepayment: string;
  creditOfficerId: string;
}

// Legacy transaction types (keeping for backward compatibility)
const TRANSACTION_STATUSES = ['Successful', 'Pending'] as const;
const TRANSACTION_TYPES = ['Repayment'] as const;

export type TransactionStatus = typeof TRANSACTION_STATUSES[number];
export type TransactionType = typeof TRANSACTION_TYPES[number];

export interface LoanTransaction {
  id: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: string;
  creditOfficerId: string;
}

/**
 * Hash function to generate consistent numeric value from string ID
 * @param str - The string to hash
 * @returns A consistent numeric hash value
 */
export function hashString(str: string): number {
  return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

/**
 * Generate credit officer details based on ID
 * @param id - The credit officer ID
 * @returns Consistent credit officer details
 */
export function generateCreditOfficerDetails(id: string): CreditOfficerDetails {
  const hash = hashString(id);
  const name = NAMES[hash % NAMES.length];
  
  return {
    id,
    name,
    coId: (46729233 + hash).toString(),
    dateJoined: 'Jan 15, 2025',
    email: `${name.toLowerCase().replace(/\s+/g, '')}234@email.com`,
    phone: `+234 812738917`,
    gender: GENDERS[hash % GENDERS.length]
  };
}

/**
 * Generate a seeded random number between min and max
 * @param seed - The seed value
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns A consistent random number
 */
function seededRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return Math.floor(random * (max - min + 1)) + min;
}

/**
 * Format date as "MMM DD, YYYY"
 * @param date - The date to format
 * @returns Formatted date string
 */
function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Generate loans for a credit officer
 * @param creditOfficerId - The credit officer ID
 * @param count - Number of loans to generate (default: 50)
 * @returns Array of consistent loan records
 */
export function generateCreditOfficerLoans(
  creditOfficerId: string,
  count: number = 50
): LoanRecord[] {
  const baseHash = hashString(creditOfficerId);
  const loans: LoanRecord[] = [];

  for (let i = 0; i < count; i++) {
    const seed = baseHash + i;
    
    // Generate loan ID (5-6 digits)
    const loanId = seededRandom(seed, 10000, 99999).toString();
    
    // Select borrower name
    const borrowerName = BORROWER_NAMES[seed % BORROWER_NAMES.length];
    
    // Determine status based on distribution
    // 60% Active, 20% Scheduled, 15% Completed, 5% Overdue
    const statusRoll = seededRandom(seed * 2, 1, 100);
    let status: LoanStatus;
    if (statusRoll <= 60) {
      status = 'Active';
    } else if (statusRoll <= 80) {
      status = 'Scheduled';
    } else if (statusRoll <= 95) {
      status = 'Completed';
    } else {
      status = 'Overdue';
    }
    
    // Generate amount between NGN10,000 and NGN100,000
    const amount = seededRandom(seed * 3, 10000, 100000);
    
    // Generate interest rate between 5% and 10% (as decimal)
    const interestRate = seededRandom(seed * 4, 500, 1000) / 10000; // 0.05 to 0.10
    
    // Generate next repayment date
    // For past dates: up to 365 days ago
    // For future dates: up to 180 days ahead
    const today = new Date();
    const daysOffset = seededRandom(seed * 5, -365, 180);
    const repaymentDate = new Date(today);
    repaymentDate.setDate(today.getDate() + daysOffset);
    
    loans.push({
      id: `loan-${creditOfficerId}-${i}`,
      loanId,
      borrowerName,
      status,
      amount,
      interestRate,
      nextRepayment: formatDate(repaymentDate),
      creditOfficerId
    });
  }

  return loans;
}

/**
 * Generate loan transactions for a credit officer (for Loans Disbursed tab)
 * @param creditOfficerId - The credit officer ID
 * @param count - Number of transactions to generate (default: 50)
 * @returns Array of consistent transaction records
 */
export function generateCreditOfficerTransactions(
  creditOfficerId: string,
  count: number = 50
): LoanTransaction[] {
  const baseHash = hashString(creditOfficerId);
  const transactions: LoanTransaction[] = [];

  for (let i = 0; i < count; i++) {
    const seed = baseHash + i;
    
    // Generate transaction ID (5-6 digits)
    const transactionId = seededRandom(seed, 10000, 99999).toString();
    
    // Type is always "Repayment" based on Figma
    const type: TransactionType = 'Repayment';
    
    // Generate amount (typically ₦35,000 in Figma, but we'll vary it)
    const amount = seededRandom(seed * 3, 25000, 50000);
    
    // Determine status: 80% Successful, 20% Pending
    const statusRoll = seededRandom(seed * 2, 1, 100);
    const status: TransactionStatus = statusRoll <= 80 ? 'Successful' : 'Pending';
    
    // Generate date within the past year
    const today = new Date();
    const daysAgo = seededRandom(seed * 5, 0, 365);
    const transactionDate = new Date(today);
    transactionDate.setDate(today.getDate() - daysAgo);
    
    transactions.push({
      id: `transaction-${creditOfficerId}-${i}`,
      transactionId,
      type,
      amount,
      status,
      date: formatDate(transactionDate),
      creditOfficerId
    });
  }

  return transactions;
}

/**
 * Generate collection transactions for a credit officer (for Collections tab)
 * @param creditOfficerId - The credit officer ID
 * @param count - Number of transactions to generate (default: 50)
 * @returns Array of consistent collection transaction records
 */
export function generateCollectionTransactions(
  creditOfficerId: string,
  count: number = 50
): CollectionTransaction[] {
  const baseHash = hashString(creditOfficerId);
  const transactions: CollectionTransaction[] = [];

  for (let i = 0; i < count; i++) {
    const seed = baseHash + i;
    
    // Generate transaction ID (TXN followed by 8 digits)
    const transactionId = `TXN${seededRandom(seed, 10000000, 99999999)}`;
    
    // Determine type: 50% Deposit, 30% Withdrawal, 20% Transfer
    const typeRoll = seededRandom(seed * 2, 1, 100);
    let type: CollectionType;
    if (typeRoll <= 50) {
      type = 'Deposit';
    } else if (typeRoll <= 80) {
      type = 'Withdrawal';
    } else {
      type = 'Transfer';
    }
    
    // Generate amount between NGN5,000 and NGN100,000
    const amount = seededRandom(seed * 3, 5000, 100000);
    
    // Determine status: 70% Completed, 20% Pending, 10% Failed
    const statusRoll = seededRandom(seed * 4, 1, 100);
    let status: CollectionStatus;
    if (statusRoll <= 70) {
      status = 'Completed';
    } else if (statusRoll <= 90) {
      status = 'Pending';
    } else {
      status = 'Failed';
    }
    
    // Generate date within the past year
    const today = new Date();
    const daysAgo = seededRandom(seed * 5, 0, 365);
    const transactionDate = new Date(today);
    transactionDate.setDate(today.getDate() - daysAgo);
    
    transactions.push({
      id: `collection-${creditOfficerId}-${i}`,
      transactionId,
      type,
      amount,
      status,
      date: formatDate(transactionDate),
      creditOfficerId
    });
  }

  return transactions;
}

/**
 * Generate disbursed loans for a credit officer (for Loans Disbursed tab)
 * @param creditOfficerId - The credit officer ID
 * @param count - Number of loans to generate (default: 50)
 * @returns Array of consistent disbursed loan records
 */
export function generateDisbursedLoans(
  creditOfficerId: string,
  count: number = 50
): DisbursedLoan[] {
  const baseHash = hashString(creditOfficerId);
  const loans: DisbursedLoan[] = [];

  for (let i = 0; i < count; i++) {
    const seed = baseHash + i;
    
    // Generate loan ID (LN followed by 6 digits)
    const loanId = `LN${seededRandom(seed, 100000, 999999)}`;
    
    // Select borrower name
    const name = BORROWER_NAMES[seed % BORROWER_NAMES.length];
    
    // Determine status: 60% Active, 30% Completed, 10% Defaulted
    const statusRoll = seededRandom(seed * 2, 1, 100);
    let status: DisbursedLoanStatus;
    if (statusRoll <= 60) {
      status = 'Active';
    } else if (statusRoll <= 90) {
      status = 'Completed';
    } else {
      status = 'Defaulted';
    }
    
    // Generate amount between NGN10,000 and NGN500,000
    const amount = seededRandom(seed * 3, 10000, 500000);
    
    // Generate interest rate between 5% and 15%
    const interest = seededRandom(seed * 4, 5, 15);
    
    // Generate next repayment date (future dates for Active loans, past for others)
    const today = new Date();
    let daysOffset: number;
    if (status === 'Active') {
      daysOffset = seededRandom(seed * 5, 1, 90); // 1-90 days in future
    } else {
      daysOffset = seededRandom(seed * 5, -365, -1); // Past dates
    }
    const repaymentDate = new Date(today);
    repaymentDate.setDate(today.getDate() + daysOffset);
    
    loans.push({
      id: `disbursed-${creditOfficerId}-${i}`,
      loanId,
      name,
      status,
      amount,
      interest,
      nextRepayment: formatDate(repaymentDate),
      creditOfficerId
    });
  }

  return loans;
}
