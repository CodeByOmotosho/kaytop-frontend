/**
 * Customer Details Data Generator
 * Generates consistent customer detail data using seeded random generation
 */

// Simple seeded random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Convert string to number seed
    this.seed = seed.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
  }

  next(): number {
    // Linear congruential generator with better parameters
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  choice<T>(array: T[]): T {
    if (!array || array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    const randomValue = this.next();
    const index = Math.floor(randomValue * array.length);
    const safeIndex = Math.max(0, Math.min(index, array.length - 1));
    const result = array[safeIndex];
    if (result === undefined) {
      throw new Error(`Array access returned undefined at index ${safeIndex} of ${array.length}`);
    }
    return result;
  }
}

// Nigerian names pool
const NIGERIAN_NAMES = [
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
  'Jumoke Adeyemi',
  'Kemi Adetiba',
  'Lanre Hassan',
  'Maryam Abacha'
];

const NIGERIAN_ADDRESSES = [
  '12 Admiralty Way, Lekki Phase 1, Lagos',
  '45 Adeola Odeku Street, Victoria Island, Lagos',
  '23 Awolowo Road, Ikoyi, Lagos',
  '78 Allen Avenue, Ikeja, Lagos',
  '34 Opebi Road, Ikeja, Lagos',
  '56 Ajose Adeogun Street, Victoria Island, Lagos',
  '89 Ozumba Mbadiwe Avenue, Victoria Island, Lagos',
  '15 Glover Road, Ikoyi, Lagos',
  '67 Akin Adesola Street, Victoria Island, Lagos',
  '90 Adetokunbo Ademola Street, Victoria Island, Lagos'
];

export interface Transaction {
  id: string;
  transactionId: string;
  type: 'Repayment' | 'Savings';
  amount: number;
  status: 'Successful' | 'Pending' | 'In Progress';
  date: string;
}

export interface Payment {
  id: string;
  paymentNumber: number;
  amount: number;
  status: 'Paid' | 'Missed' | 'Upcoming';
  dueDate: Date;
  isPaid: boolean;
}

export interface CustomerDetails {
  id: string;
  name: string;
  userId: string;
  dateJoined: string;
  email: string;
  phoneNumber: string;
  gender: 'Male' | 'Female';
  address: string;
  loanRepayment: {
    amount: number;
    nextPayment: string;
    growth: number;
    chartData: number[];
  };
  savingsAccount: {
    balance: number;
    growth: number;
    chartData: number[];
  };
  activeLoan: {
    loanId: string;
    amount: number;
    outstanding: number;
    monthlyPayment: number;
    interestRate: number;
    startDate: string;
    endDate: string;
    paymentSchedule: Payment[];
  };
  transactions: Transaction[];
}

/**
 * Generate customer details for a specific customer ID
 * @param customerId Customer ID to generate details for
 */
export function generateCustomerDetails(customerId: string): CustomerDetails {
  const rng = new SeededRandom(`customer-details-${customerId}`);

  // Generate basic customer info
  const name = rng.choice(NIGERIAN_NAMES);
  const userId = `USR-${rng.nextInt(10000, 99999)}`;
  const gender: 'Male' | 'Female' = rng.next() < 0.5 ? 'Male' : 'Female';
  const address = rng.choice(NIGERIAN_ADDRESSES);

  // Generate date joined (within past 2 years)
  const daysAgo = rng.nextInt(1, 730);
  const dateJoined = new Date();
  dateJoined.setDate(dateJoined.getDate() - daysAgo);
  const formattedDateJoined = formatDate(dateJoined);

  // Generate email from name
  const emailPrefix = name.toLowerCase().replace(/\s+/g, '');
  const email = `${emailPrefix}@gmail.com`;

  // Generate Nigerian phone number
  const phoneNumber = `+234 ${rng.nextInt(800, 909)} ${rng.nextInt(100, 999)} ${rng.nextInt(1000, 9999)}`;

  // Generate loan repayment data
  const loanRepaymentAmount = rng.nextFloat(30000, 50000);
  const loanRepaymentGrowth = rng.nextFloat(2.0, 5.0);
  const loanRepaymentChartData = [
    rng.nextFloat(40, 60), // Paid portion
    rng.nextFloat(40, 60)  // Remaining portion
  ];

  // Generate next payment date (within next 30 days)
  const nextPaymentDate = new Date();
  nextPaymentDate.setDate(nextPaymentDate.getDate() + rng.nextInt(1, 30));
  const formattedNextPayment = formatDate(nextPaymentDate);

  // Generate savings account data
  const savingsBalance = rng.nextFloat(5000, 10000);
  const savingsGrowth = rng.nextFloat(1.5, 3.5);
  const savingsChartData = [
    rng.nextFloat(20, 30),
    rng.nextFloat(20, 30),
    rng.nextFloat(20, 30),
    rng.nextFloat(20, 30)
  ];

  // Generate active loan data
  const loanAmount = rng.nextFloat(100000, 500000);
  const loanOutstanding = loanAmount * rng.nextFloat(0.3, 0.7);
  const monthlyPayment = rng.nextFloat(5000, 15000);
  const interestRate = rng.nextFloat(5, 15);

  // Generate loan start date (6-24 months ago)
  const loanStartDate = new Date();
  loanStartDate.setMonth(loanStartDate.getMonth() - rng.nextInt(6, 24));
  const formattedLoanStartDate = formatDate(loanStartDate);

  // Generate loan end date (6-24 months from now)
  const loanEndDate = new Date();
  loanEndDate.setMonth(loanEndDate.getMonth() + rng.nextInt(6, 24));
  const formattedLoanEndDate = formatDate(loanEndDate);

  const loanId = `LN-${rng.nextInt(100000, 999999)}`;

  // Generate payment schedule (10 payments)
  const paymentSchedule: Payment[] = [];
  const numberOfPayments = 10;
  
  for (let i = 0; i < numberOfPayments; i++) {
    const paymentNumber = i + 1;
    const paymentAmount = monthlyPayment;
    
    // Calculate due date (monthly intervals from start date)
    const paymentDueDate = new Date(loanStartDate);
    paymentDueDate.setMonth(paymentDueDate.getMonth() + i);
    
    // Determine status based on payment number and current date
    let status: 'Paid' | 'Missed' | 'Upcoming';
    let isPaid: boolean;
    
    const now = new Date();
    const isPastDue = paymentDueDate < now;
    
    if (i < 7) {
      // First 7 payments
      if (i === 4) {
        // Payment 5 is missed
        status = 'Missed';
        isPaid = false;
      } else {
        // Payments 1-4, 6-7 are paid
        status = 'Paid';
        isPaid = true;
      }
    } else {
      // Payments 8-10 are upcoming
      status = 'Upcoming';
      isPaid = false;
    }
    
    paymentSchedule.push({
      id: `payment-${paymentNumber}`,
      paymentNumber,
      amount: paymentAmount,
      status,
      dueDate: paymentDueDate,
      isPaid
    });
  }

  // Generate 50+ transactions
  const transactionCount = rng.nextInt(50, 80);
  const transactions: Transaction[] = [];

  for (let i = 0; i < transactionCount; i++) {
    const transactionType: 'Repayment' | 'Savings' = rng.next() < 0.6 ? 'Repayment' : 'Savings';
    const transactionAmount = rng.nextFloat(1000, 20000);
    
    // Status distribution: 80% Successful, 15% Pending, 5% In Progress
    let transactionStatus: 'Successful' | 'Pending' | 'In Progress';
    const statusRand = rng.next();
    if (statusRand < 0.8) {
      transactionStatus = 'Successful';
    } else if (statusRand < 0.95) {
      transactionStatus = 'Pending';
    } else {
      transactionStatus = 'In Progress';
    }

    // Generate transaction date (within past year)
    const transactionDaysAgo = rng.nextInt(1, 365);
    const transactionDate = new Date();
    transactionDate.setDate(transactionDate.getDate() - transactionDaysAgo);
    const formattedTransactionDate = formatDate(transactionDate);

    const transactionId = `TXN-${rng.nextInt(100000, 999999)}`;

    transactions.push({
      id: `transaction-${i + 1}`,
      transactionId,
      type: transactionType,
      amount: transactionAmount,
      status: transactionStatus,
      date: formattedTransactionDate
    });
  }

  // Sort transactions by date (most recent first)
  transactions.sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return {
    id: customerId,
    name,
    userId,
    dateJoined: formattedDateJoined,
    email,
    phoneNumber,
    gender,
    address,
    loanRepayment: {
      amount: loanRepaymentAmount,
      nextPayment: formattedNextPayment,
      growth: loanRepaymentGrowth,
      chartData: loanRepaymentChartData
    },
    savingsAccount: {
      balance: savingsBalance,
      growth: savingsGrowth,
      chartData: savingsChartData
    },
    activeLoan: {
      loanId,
      amount: loanAmount,
      outstanding: loanOutstanding,
      monthlyPayment,
      interestRate,
      startDate: formattedLoanStartDate,
      endDate: formattedLoanEndDate,
      paymentSchedule
    },
    transactions
  };
}

/**
 * Format date as "MMM DD, YYYY"
 */
function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 
                  'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * Parse date from "MMM DD, YYYY" format
 */
function parseDate(dateStr: string): Date {
  const months: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'June': 5,
    'July': 6, 'Aug': 7, 'Sept': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const parts = dateStr.split(' ');
  const month = months[parts[0]];
  const day = parseInt(parts[1].replace(',', ''));
  const year = parseInt(parts[2]);
  
  return new Date(year, month, day);
}
